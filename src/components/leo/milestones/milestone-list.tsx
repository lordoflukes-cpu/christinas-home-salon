'use client';

import { useState } from 'react';
import {
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
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
import { useLeoStore, formatDateTime, formatAge } from '@/lib/leo';
import type { MilestoneEntry, Emotion, MilestoneCategory } from '@/lib/leo';
import { GreekKey } from '../decor/greek-key';
import { MilestoneForm } from './milestone-form';
import { PhotoImage } from '../photos/photo-image';

const CATEGORY_LABEL: Record<MilestoneCategory, string> = {
  physical: '💪 Physical',
  sounds: '🗣️ Sounds',
  feeding: '🍼 Feeding',
  sleep: '😴 Sleep',
  social: '🤗 Social',
  funny: '😂 Funny',
  big: '🎉 Big moment',
};

const EMOTION_LABEL: Record<Emotion, string> = {
  proud: '🦁 Proud',
  funny: '😂 Funny',
  scary: '😬 Scary',
  beautiful: '🥹 Beautiful',
  chaotic: '🌪️ Chaotic',
};

export function MilestoneList() {
  const milestones = useLeoStore((s) => s.milestones);
  const photos = useLeoStore((s) => s.photos);
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
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        <Plus className="mr-2 h-5 w-5" /> Add a first
      </Button>

      {milestones.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 border-gold-200 bg-parchment-50 p-8 text-center">
          <Sparkles className="h-8 w-8 text-gold-500" />
          <p className="text-sm text-ink-600">
            Capture Leo&apos;s firsts — that first smile will mean the world
            later.
          </p>
        </Card>
      ) : (
        <div className="relative ml-2 space-y-3 border-l-2 border-gold-200 pl-5">
          {milestones.map((m) => {
            const photo = m.photoId
              ? photos.find((p) => p.id === m.photoId)
              : undefined;
            return (
              <div key={m.id} className="relative">
                <span className="absolute -left-[26px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-100">
                  <Star className="h-3 w-3 fill-gold-400 text-gold-500" />
                </span>
                <Card className="border-ink-300/40 p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-medium text-ink-900">{m.title}</p>
                        {m.category && (
                          <Badge variant="secondary" className="shrink-0">
                            {CATEGORY_LABEL[m.category]}
                          </Badge>
                        )}
                        {m.emotion && (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-gold-300 text-gold-700"
                          >
                            {EMOTION_LABEL[m.emotion]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-ink-500">
                        {formatDateTime(m.achievedAt)}
                        {profile
                          ? ` · ${formatAge(profile.birth, m.achievedAt)}`
                          : ''}
                      </p>

                      {photo && (
                        <PhotoImage
                          bytes={photo.bytes}
                          type={photo.type}
                          className="mt-2 max-h-56 w-full rounded-xl object-cover"
                        />
                      )}

                      {m.note && (
                        <p className="mt-2 text-sm text-ink-700">{m.note}</p>
                      )}
                      {m.noteFromChristina && (
                        <p className="mt-1 text-sm text-ink-700">
                          <span className="font-medium text-ink-900">
                            Christina:
                          </span>{' '}
                          {m.noteFromChristina}
                        </p>
                      )}

                      {(m.whoThere || m.location) && (
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-500">
                          {m.whoThere && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {m.whoThere}
                            </span>
                          )}
                          {m.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {m.location}
                            </span>
                          )}
                        </div>
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
                      <Pencil className="h-4 w-4 text-ink-500" />
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
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="border-ink-300/40">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
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
