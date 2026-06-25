'use client';

import { useState } from 'react';
import { Feather, PenLine, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  useLeoStore,
  useNow,
  formatDateTime,
  promptOfTheDay,
  promptByCategory,
} from '@/lib/leo';
import type { JournalEntry, JournalCategory } from '@/lib/leo';
import { GreekKey } from '../decor/greek-key';
import { JournalEditor } from './journal-editor';
import { PhotoImage } from '../photos/photo-image';

export function JournalList() {
  const journal = useLeoStore((s) => s.journal);
  const photos = useLeoStore((s) => s.photos);
  const removeJournal = useLeoStore((s) => s.removeJournal);
  const now = useNow(60_000);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | undefined>();
  const [seedCategory, setSeedCategory] = useState<
    JournalCategory | undefined
  >();
  const [toDelete, setToDelete] = useState<string | null>(null);

  const today = promptOfTheDay(now);

  function openNew(category?: JournalCategory) {
    setEditing(undefined);
    setSeedCategory(category);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Daily prompt */}
      <Card className="border-gold-200 bg-gradient-to-br from-gold-50 to-parchment-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">
          Today&apos;s prompt
        </p>
        <p className="mt-1 font-display text-lg text-ink-900">{today.prompt}</p>
        <Button
          onClick={() => openNew(today.category)}
          size="sm"
          className="mt-3 bg-ink-700 hover:bg-ink-800"
        >
          <PenLine className="mr-1.5 h-4 w-4" /> Write it down
        </Button>
      </Card>

      <Button
        onClick={() => openNew()}
        size="lg"
        variant="outline"
        className="min-h-12 w-full border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
      >
        <Plus className="mr-2 h-5 w-5" /> New entry
      </Button>

      {journal.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 border-gold-200 bg-parchment-50 p-8 text-center">
          <Feather className="h-8 w-8 text-gold-500" />
          <p className="text-sm text-ink-600">
            Little moments and letters he can read one day. Tell him about
            today.
          </p>
        </Card>
      ) : (
        journal.map((j) => {
          const photo = j.photoId
            ? photos.find((p) => p.id === j.photoId)
            : undefined;
          const label = promptByCategory(j.category)?.label;
          return (
            <Card
              key={j.id}
              className="border-ink-300/40 bg-gradient-to-br from-parchment-50 to-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {j.title && (
                      <h3 className="font-display text-lg font-semibold text-ink-900">
                        {j.title}
                      </h3>
                    )}
                    {label && (
                      <Badge variant="secondary" className="shrink-0">
                        {label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gold-700">
                    {formatDateTime(j.writtenAt)}
                    {j.author ? ` · ${j.author}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(j);
                      setSeedCategory(undefined);
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

              {photo && (
                <PhotoImage
                  bytes={photo.bytes}
                  type={photo.type}
                  className="mt-2 max-h-64 w-full rounded-xl object-cover"
                />
              )}

              <p className="mt-2 whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-sage-800">
                {j.body}
              </p>
            </Card>
          );
        })
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto border-ink-300/40"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              {editing ? 'Edit entry' : 'A moment to remember'}
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          <JournalEditor
            entry={editing}
            initialCategory={seedCategory}
            onDone={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <Dialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this entry?</DialogTitle>
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
