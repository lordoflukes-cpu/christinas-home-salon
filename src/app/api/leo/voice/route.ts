import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Leo's voice — text-to-speech via ElevenLabs (Jamaican-Patois reads).
 *
 * The client POSTs already-composed text (Patois for fun lines, clear English
 * for anything medical — decided client-side) and gets back MP3 audio. The
 * ElevenLabs key + voice id stay server-side and are never exposed to the app.
 * Only text is ever sent.
 */

// High-quality model so the read matches the rich Denzel preview (not robotic).
// Override with ELEVENLABS_MODEL (e.g. 'eleven_flash_v2_5' for lower latency).
const DEFAULT_MODEL = 'eleven_multilingual_v2';

const requestSchema = z.object({
  text: z.string().min(1).max(600),
});

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    // Default voice: "Denzel — Jamaican, raspy & deep". Override via env.
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'dhwafD61uVd8h85wAZSE';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Voice not configured' },
        { status: 503 },
      );
    }

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    if (!checkRateLimit(`leo-voice:${ip}`, 30)) {
      return NextResponse.json(
        { error: 'Too many voice requests. Please wait a moment.' },
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

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: parsed.data.text,
          model_id: process.env.ELEVENLABS_MODEL || DEFAULT_MODEL,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.3,
          },
        }),
      },
    );

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json(
          { error: 'Voice is busy right now — please try again shortly.' },
          { status: 429 },
        );
      }
      const detail = await res.text().catch(() => '');
      console.error('ElevenLabs error:', res.status, detail.slice(0, 300));
      return NextResponse.json(
        { error: 'Couldn’t generate the voice. Please try again.' },
        { status: 502 },
      );
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Leo voice error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
