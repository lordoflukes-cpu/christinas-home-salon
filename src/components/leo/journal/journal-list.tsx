'use client';

import { useState } from 'react';
import { Feather, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useLeoStore, formatDateTime } from '@/lib/leo';
import type { JournalEntry } from '@/lib/leo';
import { GreekKey } from '../decor/greek-key';
import { JournalEditor } from './journal-editor';

export function JournalList() {
  const journal = useLeoStore((s) => s.journal);
  const removeJournal = useLeoStore((s) => s.removeJournal);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | undefined>();
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Button
        onClick={() => {
          setEditing(undefined);
          setSheetOpen(true);
        }}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        <Plus className="mr-2 h-5 w-5" /> Write to Leo
      </Button>

      {journal.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 border-gold-200 bg-parchment-50 p-8 text-center">
          <Feather className="h-8 w-8 text-gold-500" />
          <p className="text-sm text-ink-600">
            Little letters he can read one day. Tell him about today.
          </p>
        </Card>
      ) : (
        journal.map((j) => (
          <Card
            key={j.id}
            className="border-ink-300/40 bg-gradient-to-br from-parchment-50 to-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {j.title && (
                  <h3 className="font-display text-lg font-semibold text-ink-900">
                    {j.title}
                  </h3>
                )}
                <p className="text-xs text-gold-700">
                  {formatDateTime(j.writtenAt)}
                </p>
              </div>
              <div className="flex shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditing(j);
                    setSheetOpen(true);
                  }}
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4 text-ink-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setToDelete(j.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-sage-800">
              {j.body}
            </p>
          </Card>
        ))
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto border-ink-300/40"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              {editing ? 'Edit letter' : 'A letter to Leo'}
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          <JournalEditor entry={editing} onDone={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      <Dialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this letter?</DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                if (toDelete) await removeJournal(toDelete);
                setToDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
