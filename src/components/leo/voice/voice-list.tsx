'use client';

import { useMemo, useState } from 'react';
import { Heart, Mic, Pencil, Plus, Trash2 } from 'lucide-react';
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
  useVoiceUrl,
  formatDateTime,
  formatDuration,
  voiceCategory,
  VOICE_CATEGORIES,
} from '@/lib/leo';
import type { VoiceEntry, VoiceCategory } from '@/lib/leo';
import { cn } from '@/lib/utils';
import { GreekKey } from '../decor/greek-key';
import { VoiceEditor } from './voice-editor';

type Filter = 'all' | VoiceCategory;

function VoiceCard({
  voice,
  onEdit,
  onDelete,
}: {
  voice: VoiceEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const editVoice = useLeoStore((s) => s.editVoice);
  const blob = useMemo(
    () => new Blob([voice.bytes], { type: voice.type || 'audio/webm' }),
    [voice.bytes, voice.type],
  );
  const url = useVoiceUrl(blob);
  const cat = voiceCategory(voice.category);

  return (
    <Card className="border-ink-300/40 bg-gradient-to-br from-parchment-50 to-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {voice.title && (
              <h3 className="font-display text-lg font-semibold text-ink-900">
                {voice.title}
              </h3>
            )}
            {cat && (
              <Badge variant="secondary" className="shrink-0">
                {cat.emoji} {cat.label}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gold-700">
            {formatDateTime(voice.recordedAt)}
            {voice.durationMs ? ` · ${formatDuration(voice.durationMs)}` : ''}
            {voice.author ? ` · ${voice.author}` : ''}
          </p>
        </div>
        <div className="flex shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              void editVoice(voice.id, { favourite: !voice.favourite })
            }
            aria-label="Favourite"
          >
            <Heart
              className={cn(
                'h-4 w-4',
                voice.favourite
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-ink-400',
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4 text-ink-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      </div>

      {url && <audio controls src={url} className="mt-2 w-full" />}

      {voice.transcript && (
        <p className="mt-2 whitespace-pre-wrap font-serif text-[15px] italic leading-relaxed text-sage-800">
          &ldquo;{voice.transcript}&rdquo;
        </p>
      )}
    </Card>
  );
}

export function VoiceList() {
  const voices = useLeoStore((s) => s.voices);
  const removeVoice = useLeoStore((s) => s.removeVoice);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<VoiceEntry | undefined>();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  // Only show filter chips for categories that actually have notes.
  const present = new Set(voices.map((v) => v.category).filter(Boolean));
  const filters = VOICE_CATEGORIES.filter((c) => present.has(c.category));

  const shown =
    filter === 'all' ? voices : voices.filter((v) => v.category === filter);

  function openNew() {
    setEditing(undefined);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={openNew}
        size="lg"
        className="min-h-12 w-full bg-rose-500 text-base hover:bg-rose-600"
      >
        <Mic className="mr-2 h-5 w-5" /> Record a moment
      </Button>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="All"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          {filters.map((c) => (
            <FilterChip
              key={c.category}
              label={`${c.emoji} ${c.label}`}
              active={filter === c.category}
              onClick={() => setFilter(c.category)}
            />
          ))}
        </div>
      )}

      {voices.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 border-rose-200 bg-parchment-50 p-8 text-center">
          <Mic className="h-8 w-8 text-rose-400" />
          <p className="text-sm text-ink-600">
            An audio time capsule — coos, laughs, first words and little
            messages. Record Leo&apos;s first proper little noise. 👶
          </p>
        </Card>
      ) : (
        shown.map((v) => (
          <VoiceCard
            key={v.id}
            voice={v}
            onEdit={() => {
              setEditing(v);
              setSheetOpen(true);
            }}
            onDelete={() => setToDelete(v.id)}
          />
        ))
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto border-ink-300/40"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              {editing ? 'Edit voice note' : 'A moment to remember'}
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          <VoiceEditor entry={editing} onDone={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      <Dialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this voice note?</DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                if (toDelete) await removeVoice(toDelete);
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

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-ink-700 bg-ink-700 text-parchment-50'
          : 'border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100',
      )}
    >
      {label}
    </button>
  );
}
