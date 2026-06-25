'use client';

import { useState } from 'react';
import { Copy, Check, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore, useNow, doctorSummary } from '@/lib/leo';
import { Segmented } from '../forms/feed-form';

export function DoctorSummarySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const profile = useLeoStore((s) => s.profile);
  const events = useLeoStore((s) => s.events);
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const sleeps = useLeoStore((s) => s.sleeps);
  const now = useNow(60_000);
  const { toast } = useToast();
  const [days, setDays] = useState('7');
  const [copied, setCopied] = useState(false);

  const text = doctorSummary({
    events,
    feeds,
    diapers,
    sleeps,
    now,
    days: Number(days),
    name: profile?.name,
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: 'Copied', description: 'Summary copied to clipboard.' });
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
            <Stethoscope className="h-5 w-5 text-aegean-600" /> Doctor summary
          </SheetTitle>
          <SheetDescription>
            A clear summary of recent days — read it out or copy it for an
            appointment.
          </SheetDescription>
        </SheetHeader>

        <div className="mb-3">
          <Segmented
            value={days}
            onChange={setDays}
            options={[
              { value: '3', label: '3 days' },
              { value: '7', label: '7 days' },
              { value: '14', label: '14 days' },
            ]}
          />
        </div>

        <pre className="max-h-[40vh] overflow-auto whitespace-pre-wrap rounded-xl border border-ink-300/40 bg-parchment-50 p-4 font-serif text-[15px] leading-relaxed text-ink-800">
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
              <Copy className="mr-2 h-5 w-5" /> Copy summary
            </>
          )}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
