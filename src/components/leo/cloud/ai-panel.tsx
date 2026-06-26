import Link from 'next/link';
import type { Route } from 'next';
import {
  Sparkles,
  MessageCircle,
  Mic,
  Stethoscope,
  HeartHandshake,
  Volume2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const THINGS: { icon: typeof Sparkles; title: string; desc: string }[] = [
  {
    icon: MessageCircle,
    title: 'Ask anything about Leo',
    desc: '“When did he last feed?”, “How was his week?”',
  },
  {
    icon: HeartHandshake,
    title: 'What might help right now',
    desc: 'Suggestions from what’s settled him before',
  },
  {
    icon: Stethoscope,
    title: 'Doctor notes & summaries',
    desc: 'A tidy, factual recap for an appointment',
  },
  {
    icon: Mic,
    title: 'Say what happened',
    desc: 'Speak a feed or nappy and confirm — on the Home tab',
  },
];

/**
 * Ask Leo (AI) hub — a clear place to find and start the AI, plus where its
 * settings live. The AI organises what you've logged; it never diagnoses.
 */
export function AiPanel() {
  return (
    <Card className="border-ink-300/40 p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
        <Sparkles className="h-5 w-5 text-gold-600" /> Ask Leo (AI)
      </h2>
      <p className="mb-4 text-sm text-ink-600">
        Leo’s assistant makes sense of what you’ve logged — summaries, gentle
        patterns, doctor notes and more. It only reads your text (never photos)
        and never gives medical advice.
      </p>

      <Button
        asChild
        size="lg"
        className="mb-4 min-h-12 w-full bg-ink-700 hover:bg-ink-800"
      >
        <Link href={'/leo/ask' as Route}>
          <Sparkles className="mr-2 h-5 w-5" /> Open Ask Leo
        </Link>
      </Button>

      <div className="space-y-2">
        {THINGS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl border border-ink-200/60 bg-parchment-50/60 p-3"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-ink-900">
                {title}
              </span>
              <span className="block text-xs text-ink-500">{desc}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-aegean-50 px-3 py-2 text-xs text-aegean-900">
        <Volume2 className="mt-0.5 h-4 w-4 shrink-0" />
        Want answers spoken in Leo’s voice? Turn on “Ask Leo answers” (and “Read
        aloud automatically”) in <strong>Leo’s voice</strong> above.
      </p>

      <p className="mt-2 text-center text-xs text-ink-400">
        Needs the Anthropic key set up on the server. Until then, Ask Leo shows
        a gentle “not set up yet” message.
      </p>
    </Card>
  );
}
