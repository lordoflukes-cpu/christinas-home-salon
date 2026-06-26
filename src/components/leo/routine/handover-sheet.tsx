'use client';

import { useState } from 'react';
import { Copy, Check, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore, useNow, buildHandover } from '@/lib/leo';

export function HandoverSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const profile = useLeoStore((s) => s.profile);
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const sleeps = useLeoStore((s) => s.sleeps);
  const sessions = useLeoStore((s) => s.routineSessions);
  const now = useNow(60_000);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const text = buildHandover({
    sessions,
    feeds,
    diapers,
    sleeps,
    now,
    profile,
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: 'Copied', description: 'Handover copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Couldn’t copy',
        description: 'Select and copy the text manually.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="border-ink-300/40">
        <SheetHeader className="mb-3">
          <SheetTitle className="flex items-center gap-2 font-display text-xl text-ink-900">
            <ArrowLeftRight className="h-5 w-5 text-aegean-600" /> Handover
          </SheetTitle>
          <SheetDescription>
            A quick summary for whoever takes over — last feed, nappy, sleep and
            what just worked.
          </SheetDescription>
        </SheetHeader>

        <pre className="max-h-[44vh] overflow-auto whitespace-pre-wrap rounded-xl border border-ink-300/40 bg-parchment-50 p-4 font-serif text-[15px] leading-relaxed text-ink-800">
          {text}
        </pre>

        <Button
          onClick={copy}
          size="lg"
          className="mt-4 min-h-12 w-full bg-ink-700 hover:bg-ink-800"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-5 w-5" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-5 w-5" /> Copy handover
            </>
          )}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
