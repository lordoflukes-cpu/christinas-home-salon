'use client';

import { useState } from 'react';
import { Pencil, Plus, Sparkles, Star, Trash2 } from 'lucide-react';
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
import { useLeoStore, formatDateTime, formatAge } from '@/lib/leo';
import type { MilestoneEntry } from '@/lib/leo';
import { GreekKey } from '../decor/greek-key';
import { MilestoneForm } from './milestone-form';

export function MilestoneList() {
  const milestones = useLeoStore((s) => s.milestones);
  const profile = useLeoStore((s) => s.profile);
  const removeMilestone = useLeoStore((s) => s.removeMilestone);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<MilestoneEntry | undefined>();
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Button
        onClick={() => {
          setEditing(undefined);
          setSheetOpen(true);
        }}
        size="lg"
        className="min-h-14 w-full bg-rose-500 text-base hover:bg-rose-600"
      >
        <Plus className="mr-2 h-5 w-5" /> Add a first
      </Button>

      {milestones.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 border-gold-200 bg-cream-50 p-8 text-center">
          <Sparkles className="h-8 w-8 text-gold-500" />
          <p className="text-sm text-sage-600">
            Capture Leo&apos;s firsts — that first smile will mean the world
            later.
          </p>
        </Card>
      ) : (
        <div className="relative ml-2 space-y-3 border-l-2 border-gold-200 pl-5">
          {milestones.map((m) => (
            <div key={m.id} className="relative">
              <span className="absolute -left-[26px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-100">
                <Star className="h-3 w-3 fill-gold-400 text-gold-500" />
              </span>
              <Card className="border-cream-200 p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-night-900">{m.title}</p>
                    <p className="text-xs text-sage-500">
                      {formatDateTime(m.achievedAt)}
                      {profile
                        ? ` · ${formatAge(profile.birth, m.achievedAt)}`
                        : ''}
                    </p>
                    {m.note && (
                      <p className="mt-1 text-sm text-sage-700">{m.note}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(m);
                      setSheetOpen(true);
                    }}
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4 text-sage-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete(m.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="border-cream-200">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-night-900">
              {editing ? 'Edit milestone' : 'A new first 🌟'}
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          <MilestoneForm entry={editing} onDone={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      <Dialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this milestone?</DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                if (toDelete) await removeMilestone(toDelete);
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
