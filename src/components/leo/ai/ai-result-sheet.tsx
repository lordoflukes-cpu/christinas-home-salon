'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  Save,
  Sparkles,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore, type AiTask } from '@/lib/leo';

export interface AiResultState {
  task: AiTask;
  /** Loading while the request is in flight. */
  loading: boolean;
  text?: string;
  error?: string;
  notConfigured?: boolean;
}

export function AiResultSheet({
  state,
  onClose,
}: {
  state: AiResultState | null;
  onClose: () => void;
}) {
  const createJournal = useLeoStore((s) => s.createJournal);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const open = state !== null;

  async function copy() {
    if (!state?.text) return;
    try {
      await navigator.clipboard.writeText(state.text);
      setCopied(true);
      toast({ title: 'Copied', description: 'Copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Couldn’t copy',
        description: 'Select and copy the text manually.',
        variant: 'destructive',
      });
    }
  }

  async function save() {
    if (!state?.text) return;
    try {
      await createJournal({
        writtenAt: Date.now(),
        title: state.task.label,
        body: state.text,
        category: state.task.key === 'family-update' ? 'message' : undefined,
      });
      setSaved(true);
      toast({
        title: 'Saved',
        description: 'Added to your memory journal.',
      });
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast({
        title: 'Couldn’t save',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="border-ink-300/40">
        <SheetHeader className="mb-3">
          <SheetTitle className="flex items-center gap-2 font-display text-xl text-ink-900">
            <span aria-hidden>{state?.task.emoji}</span>{' '}
            {state?.task.label ?? 'Ask Leo'}
          </SheetTitle>
          <SheetDescription>
            Ask Leo organises what you’ve logged — it doesn’t give medical
            advice or diagnose.
          </SheetDescription>
        </SheetHeader>

        {state?.loading ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-ink-500">
            <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
            <p className="font-serif text-sm">Ask Leo is thinking…</p>
          </div>
        ) : state?.notConfigured ? (
          <div className="flex min-h-[24vh] flex-col items-center justify-center gap-3 px-6 text-center text-ink-600">
            <Sparkles className="h-8 w-8 text-gold-400" />
            <p className="font-display text-lg text-ink-900">
              Ask Leo isn’t set up yet
            </p>
            <p className="text-sm text-ink-500">
              The AI helper needs an Anthropic API key on the server. Once it’s
              added, this screen will come to life.
            </p>
          </div>
        ) : state?.error ? (
          <div className="flex min-h-[24vh] flex-col items-center justify-center gap-3 px-6 text-center text-ink-600">
            <AlertTriangle className="h-7 w-7 text-rose-400" />
            <p className="text-sm">{state.error}</p>
          </div>
        ) : (
          <pre className="max-h-[44vh] overflow-auto whitespace-pre-wrap rounded-xl border border-ink-300/40 bg-parchment-50 p-4 font-serif text-[15px] leading-relaxed text-ink-800">
            {state?.text}
          </pre>
        )}

        {state && !state.loading && state.text && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={copy}
              size="lg"
              className="min-h-12 flex-1 bg-ink-700 hover:bg-ink-800"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-5 w-5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-5 w-5" /> Copy
                </>
              )}
            </Button>
            {state.task.saveable && (
              <Button
                onClick={save}
                size="lg"
                variant="outline"
                className="min-h-12 flex-1 border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
              >
                {saved ? (
                  <>
                    <Check className="mr-2 h-5 w-5" /> Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Save to journal
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
