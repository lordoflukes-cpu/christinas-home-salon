'use client';

import { useState } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { GreekKey } from '../decor/greek-key';
import { VoiceEditor } from './voice-editor';

/** One-tap "Record a moment" entry point (used on the Home dashboard). */
export function VoiceRecordButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className={
          className ?? 'min-h-12 w-full bg-rose-500 text-base hover:bg-rose-600'
        }
      >
        <Mic className="mr-2 h-5 w-5" /> Record a moment
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto border-ink-300/40"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              A moment to remember
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          <VoiceEditor onDone={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
