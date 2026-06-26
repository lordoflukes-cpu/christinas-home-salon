import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { checkRateLimit } from '@/lib/rate-limit';

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
    'summary-day',
    'summary-week',
    'patterns',
    'doctor-notes',
    'family-update',
    'memory-prompt',
    'baby-book',
    'question',
    'yearly-recap',
  ]),
  context: z.string().min(1).max(20000),
  question: z.string().max(500).optional(),
});

const SYSTEM_PROMPT = `You are "Ask Leo", a warm, gentle assistant inside a private baby-tracking app used by Leo's parents. You help them make sense of what they have already logged about their baby — feeds, nappies, sleep, health events, milestones, journal notes and growth.

Your job is to ORGANISE and reflect back the parents' own observations in clear, kind, parent-friendly language. Write in British English. Be concise and human — never clinical, never alarming.

You are working only from the text the parents provide; you cannot see photos and have no other information. If something isn't in the notes, say so plainly rather than inventing it.

IMPORTANT — this is non-negotiable: you do NOT give medical advice and you do NOT diagnose. You organise observations, you do not interpret them as medical conclusions. If the notes suggest a possible health concern, gently suggest they speak to their GP, health visitor, or call 111 — and never imply what any symptom "means".`;

const TASK_INSTRUCTIONS: Record<string, string> = {
  'right-now':
    'Given the current situation and what has settled Leo before, name the single most likely thing he needs right now, then 2–3 things to try — ranked by what has actually worked for him at similar times or with similar cues. Be brief, warm and practical (a few short lines or bullets a tired parent can act on at a glance). Lean on his own logged wins. Organise the observations; do NOT diagnose. If anything looks like it could be a health concern, gently suggest contacting a GP, health visitor, or 111.',
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

    const { task, context, question } = parsed.data;
    const instruction = TASK_INSTRUCTIONS[task];

    const userContent =
      `${instruction}\n\n` +
      (question ? `The parent asked: ${question}\n\n` : '') +
      `Here is what has been logged:\n\n${context}`;

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
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
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
