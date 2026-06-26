import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { checkRateLimit } from '@/lib/rate-limit';
import { patwahStyleInstruction } from '@/lib/leo/patwah';
import { LOG_SYSTEM, parseEntries } from '@/lib/leo/log-parse';
import { REMINDER_ADVICE_SYSTEM, parseAdvice } from '@/lib/leo/reminder-advice';
import { EXTRACT_SYSTEM, parseActions } from '@/lib/leo/report-actions';
import { DISTIL_SYSTEM, parseMemoryOps } from '@/lib/leo/memory';

/**
 * "Ask Leo" — the only server-side touchpoint for the AI helper.
 *
 * The client builds a compact TEXT context (no photos) from on-device logs and
 * POSTs it here; this route adds the system prompt + per-task instruction and
 * calls Claude. The API key stays server-side and is never exposed to the app.
 *
 * Medical guardrail (owner's requirement): the assistant ORGANISES observations,
 * it does not diagnose or give medical advice — baked into the system prompt.
 */

const MODEL = 'claude-sonnet-4-6';

const requestSchema = z.object({
  task: z.enum([
    'right-now',
    'daily-briefing',
    'summary-day',
    'summary-week',
    'patterns',
    'doctor-notes',
    'family-update',
    'memory-prompt',
    'baby-book',
    'question',
    'yearly-recap',
    'parse-log',
    'chat',
    'reminder-advice',
    'extract-actions',
    'distil-memories',
    'research',
  ]),
  context: z.string().min(1).max(20000),
  question: z.string().max(500).optional(),
  /** Recalled Second-Brain memories injected into the chat system prompt. */
  memories: z.string().max(4000).optional(),
  /** Conversation history for the `chat` task (oldest → newest). */
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      }),
    )
    .max(16)
    .optional(),
  /** When set, generate the reply in Jamaican Patois at this strength. */
  patwah: z.enum(['light', 'medium', 'heavy']).optional(),
});

const RESEARCH_INSTRUCTION = `You are doing a deeper "research" pass for the parent — thinking carefully across everything provided (your remembered facts about Leo, the day/week summaries, health snapshot, routines and growth). Work out what matters most right now and organise your answer under clear, short headings:
- "What's important" — the few things that genuinely stand out (lead with any health/allergy facts).
- "Going well" — what's positive and worth keeping up.
- "Worth keeping an eye on" — gentle, tentative observations (never alarming, never a diagnosis).
- "What might help" — 2–4 practical, kind suggestions grounded in what's actually worked for Leo.
Be thorough but readable. You ORGANISE observations; you do NOT diagnose or give medical advice. For anything health-related, suggest the GP, health visitor or 111. Write in warm British English.`;

const CHAT_INSTRUCTION = `You are now in a back-and-forth conversation with the parent. Reply to their latest message naturally and concisely, like a kind, knowledgeable friend — not a report. Use the snapshot of Leo's logged data below for facts; if something isn't there, say so rather than inventing it. When they ask how Leo is doing or to "review" things, organise your answer as what's going WELL and what's worth GENTLY keeping an eye on. Never diagnose or give medical advice; for anything health-related, suggest their GP, health visitor or 111.`;

const SYSTEM_PROMPT = `You are "Ask Leo", a warm, gentle assistant inside a private baby-tracking app used by Leo's parents. You help them make sense of what they have already logged about their baby — feeds, nappies, sleep, health events, milestones, journal notes and growth.

Your job is to ORGANISE and reflect back the parents' own observations in clear, kind, parent-friendly language. Write in British English. Be concise and human — never clinical, never alarming.

You are working only from the text the parents provide; you cannot see photos and have no other information. If something isn't in the notes, say so plainly rather than inventing it.

IMPORTANT — this is non-negotiable: you do NOT give medical advice and you do NOT diagnose. You organise observations, you do not interpret them as medical conclusions. If the notes suggest a possible health concern, gently suggest they speak to their GP, health visitor, or call 111 — and never imply what any symptom "means".`;

const TASK_INSTRUCTIONS: Record<string, string> = {
  'right-now':
    'Given the current situation and what has settled Leo before, name the single most likely thing he needs right now, then 2–3 things to try — ranked by what has actually worked for him at similar times or with similar cues. Be brief, warm and practical (a few short lines or bullets a tired parent can act on at a glance). Lean on his own logged wins. Organise the observations; do NOT diagnose. If anything looks like it could be a health concern, gently suggest contacting a GP, health visitor, or 111.',
  'daily-briefing':
    'Write a short, warm daily briefing (3–5 sentences) on how Leo has been — today so far and the last few days. Gently note 1–2 patterns you genuinely notice (timing of fussiness, what’s settling him best, sleep or feed rhythm), framed as soft observations, never as anything medical or worrying. End on a kind, encouraging note for the parents. Keep it calm and brief — this is a glance, not a report.',
  'summary-day':
    'Write a short, warm paragraph (2–4 sentences) summarising how the day went for the baby, in the parents’ voice. Start naturally, e.g. "Leo had a settled day…".',
  'summary-week':
    'Write a warm, readable summary of the past week (one short paragraph, optionally a few bullet points for standout days). Keep it encouraging.',
  patterns:
    'Point out 2–4 gentle, tentative patterns you notice across the days (e.g. "he often seems fussier after evening feeds"). Frame them as observations, not conclusions, and never as anything medical. End by noting these are just patterns in what was logged.',
  'doctor-notes':
    'Tidy the factual summary into clear, neutral notes a parent could read out or hand to a GP/health visitor. Keep it factual and chronological. Do not add interpretation or diagnosis — just organise what is there.',
  'family-update':
    'Write a warm, shareable message for grandparents/family about how the baby is doing (a few friendly sentences). Affectionate but not gushing.',
  'memory-prompt':
    'Using the prompt and recent highlights, write a gentle 1–2 sentence nudge inviting the parent to capture a memory from today. Make it feel personal and easy to answer.',
  'baby-book':
    'Write a short keepsake "baby book" chapter for this period — warm, narrative, a few sentences — drawing on the highlights. Something lovely to keep.',
  question:
    'Answer the parent’s question using only the logged information provided. If the answer isn’t in the notes, say so kindly. Keep it short and direct.',
  'yearly-recap':
    'Write a warm look back over the baby’s journey so far, weaving the milestones and highlights into a few heartfelt paragraphs. A keepsake to treasure.',
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
    }

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    // A little more generous than booking: 10 AI requests/minute.
    if (!checkRateLimit(`leo-ai:${ip}`, 10)) {
      return NextResponse.json(
        { error: 'You’re asking quickly! Please wait a moment and try again.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { task, context, question, patwah, memories: recalled } = parsed.data;

    // Voice → auto-log: convert a free-text/spoken note into structured entries
    // (JSON only). Returns proposals the client confirms before anything writes.
    if (task === 'parse-log') {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: LOG_SYSTEM,
        messages: [{ role: 'user', content: context }],
      });
      const raw = message.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      const parsedEntries = parseEntries(raw);
      if (!parsedEntries) {
        return NextResponse.json(
          { error: 'Couldn’t quite catch that — try saying it another way.' },
          { status: 502 },
        );
      }
      return NextResponse.json({ entries: parsedEntries.entries });
    }

    const { messages } = parsed.data;

    // Conversational chat — multi-turn. The snapshot + guardrail live in the
    // system prompt; the turns are the actual conversation.
    if (task === 'chat') {
      if (!messages || messages.length === 0) {
        return NextResponse.json(
          { error: 'No message to reply to.' },
          { status: 400 },
        );
      }
      const chatSystem =
        `${SYSTEM_PROMPT}\n\n${CHAT_INSTRUCTION}` +
        (patwah ? `\n\n${patwahStyleInstruction(patwah)}` : '') +
        (recalled ? `\n\n${recalled}` : '') +
        `\n\nSnapshot of what's been logged about Leo:\n\n${context}`;
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 1200,
        system: chatSystem,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      const text = message.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      if (!text) {
        return NextResponse.json(
          { error: 'Leo didn’t have anything to say. Please try again.' },
          { status: 502 },
        );
      }
      return NextResponse.json({ text });
    }

    // Notification-timing recommendation — structured JSON the panel applies.
    if (task === 'reminder-advice') {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 700,
        system: REMINDER_ADVICE_SYSTEM,
        messages: [{ role: 'user', content: context }],
      });
      const raw = message.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      const advice = parseAdvice(raw);
      if (!advice) {
        return NextResponse.json(
          { error: 'Couldn’t work out a suggestion just now.' },
          { status: 502 },
        );
      }
      return NextResponse.json({ advice });
    }

    // "File this for me" — turn a pasted report/notes into proposed actions
    // across the app (JSON only). The client confirms each before writing.
    if (task === 'extract-actions') {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: MODEL,
        // A full red-book report yields many actions + long notes; give the
        // model enough room so the JSON isn't truncated mid-object.
        max_tokens: 4096,
        system: EXTRACT_SYSTEM,
        messages: [{ role: 'user', content: context }],
      });
      const raw = message.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      const parsedActions = parseActions(raw);
      if (!parsedActions) {
        return NextResponse.json(
          { error: 'Couldn’t make sense of that — try rephrasing it.' },
          { status: 502 },
        );
      }
      return NextResponse.json({ actions: parsedActions.actions });
    }

    // Distil durable memories from the recent conversation (JSON only). The
    // client auto-saves non-health ops and confirms health-critical ones.
    if (task === 'distil-memories') {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: DISTIL_SYSTEM,
        messages: [{ role: 'user', content: context }],
      });
      const raw = message.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      const ops = parseMemoryOps(raw);
      // Distillation is best-effort: on a parse miss, just return nothing.
      return NextResponse.json({ memories: ops?.memories ?? [] });
    }

    // Deep research — a thorough reasoning pass over everything we know.
    if (task === 'research') {
      const researchSystem =
        `${SYSTEM_PROMPT}\n\n${RESEARCH_INSTRUCTION}` +
        (patwah ? `\n\n${patwahStyleInstruction(patwah)}` : '') +
        (recalled ? `\n\n${recalled}` : '');
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 2000,
        system: researchSystem,
        messages: [
          {
            role: 'user',
            content:
              (question ? `The parent asked: ${question}\n\n` : '') +
              `Here is everything to work from:\n\n${context}`,
          },
        ],
      });
      const text = message.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      if (!text) {
        return NextResponse.json(
          { error: 'Couldn’t pull a research read together just now.' },
          { status: 502 },
        );
      }
      return NextResponse.json({ text });
    }

    const instruction = TASK_INSTRUCTIONS[task];

    // Patois generation — never for clinical doctor notes.
    const system =
      patwah && task !== 'doctor-notes'
        ? `${SYSTEM_PROMPT}\n\n${patwahStyleInstruction(patwah)}`
        : SYSTEM_PROMPT;

    const userContent =
      `${instruction}\n\n` +
      (question ? `The parent asked: ${question}\n\n` : '') +
      `Here is what has been logged:\n\n${context}`;

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system,
      messages: [{ role: 'user', content: userContent }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!text) {
      return NextResponse.json(
        { error: 'Ask Leo didn’t have anything to say. Please try again.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'Ask Leo is busy right now — please try again shortly.' },
        { status: 429 },
      );
    }
    if (
      error instanceof Anthropic.APIError &&
      (error.status === 529 || error.status === 503)
    ) {
      return NextResponse.json(
        { error: 'Ask Leo is busy right now — please try again shortly.' },
        { status: 503 },
      );
    }
    console.error('Leo AI error:', error);
    // Surface the underlying reason (it never contains the API key) so a
    // failure is diagnosable instead of an opaque "something went wrong".
    const detail =
      error instanceof Anthropic.APIError
        ? `${error.status ?? ''} ${error.message}`.trim()
        : error instanceof Error
          ? error.message
          : undefined;
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.', detail },
      { status: 500 },
    );
  }
}
