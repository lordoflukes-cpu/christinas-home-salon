'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  Check,
  CircleSlash,
  Trash2,
  Pencil,
  ExternalLink,
  Volume2,
  Droplets,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  useLeoStore,
  useSpeaker,
  relativeDue,
  agendaSpeech,
  DEFAULT_VOICE_PREFS,
  type AgendaItem,
} from '@/lib/leo';

/** Epoch ms → value for an <input type="datetime-local"> (local time). */
function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/**
 * Tap an agenda item → this bottom sheet lets you act on it directly (done /
 * missed / delete / edit / open) instead of just bouncing to a page.
 */
export function AgendaItemSheet({
  item,
  now,
  onClose,
}: {
  item: AgendaItem | null;
  now: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { speak } = useSpeaker();

  const medical = useLeoStore((s) => s.medical);
  const profile = useLeoStore((s) => s.profile);
  const editMedical = useLeoStore((s) => s.editMedical);
  const removeMedical = useLeoStore((s) => s.removeMedical);
  const createMedical = useLeoStore((s) => s.createMedical);
  const markCareDone = useLeoStore((s) => s.markCareDone);
  const removeCareTask = useLeoStore((s) => s.removeCareTask);

  const medId = item?.key.startsWith('med-') ? item.key.slice(4) : null;
  const med = medId ? (medical.find((m) => m.id === medId) ?? null) : null;

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [at, setAt] = useState('');

  useEffect(() => {
    if (med) {
      setTitle(med.title);
      setAt(toLocalInput(med.at));
    }
    setEditing(false);
  }, [med?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) {
    return (
      <Sheet open={false} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" />
      </Sheet>
    );
  }

  const isCare = Boolean(item.careTaskId);
  const isMedical = Boolean(medId);
  const isVitd = item.key === 'vitd';

  const voicePrefs = profile?.voicePrefs ?? DEFAULT_VOICE_PREFS;
  const canSpeak = voicePrefs.enabled && voicePrefs.speakReminders;

  async function markMedical(missed: boolean) {
    if (!medId) return;
    await editMedical(medId, { done: true, missed: missed || undefined });
    toast({ title: missed ? 'Marked as missed' : 'Done 🦁' });
    onClose();
  }

  async function saveMedical() {
    if (!medId) return;
    const ms = new Date(at).getTime();
    await editMedical(medId, {
      title: title.trim() || med?.title,
      at: Number.isNaN(ms) ? med?.at : ms,
    });
    toast({ title: 'Saved' });
    setEditing(false);
  }

  async function deleteMedical() {
    if (!medId) return;
    await removeMedical(medId);
    toast({ title: 'Deleted' });
    onClose();
  }

  async function careDone(skip: boolean) {
    if (!item?.careTaskId) return;
    await markCareDone(item.careTaskId);
    toast({ title: skip ? 'Skipped — see you next time' : 'Done 🦁' });
    onClose();
  }

  async function careDelete() {
    if (!item?.careTaskId) return;
    await removeCareTask(item.careTaskId);
    toast({ title: 'Reminder removed' });
    onClose();
  }

  async function vitdGiven() {
    await createMedical({
      at: Date.now(),
      kind: 'medication',
      title: 'Vitamin D',
      done: true,
    });
    toast({ title: 'Vitamin D logged 💧' });
    onClose();
  }

  function open() {
    if (item?.href) router.push(item.href as Route);
    onClose();
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="mb-3 text-left">
          <SheetTitle className="flex items-center gap-2 font-display text-xl text-ink-900">
            <span className="text-2xl leading-none">{item.emoji}</span>
            {item.title}
          </SheetTitle>
          <SheetDescription>
            {item.subtitle ? `${item.subtitle} · ` : ''}
            <span className={item.overdue ? 'text-rose-500' : ''}>
              {relativeDue(item.dueAt, now)}
            </span>
          </SheetDescription>
        </SheetHeader>

        {/* Inline edit for medical items (appointments / jabs / meds) */}
        {isMedical && editing ? (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-ink-500">
              Title
            </label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className="block text-xs font-medium text-ink-500">
              Date &amp; time
            </label>
            <Input
              type="datetime-local"
              value={at}
              onChange={(e) => setAt(e.target.value)}
            />
            <div className="flex gap-2 pt-1">
              <Button
                onClick={saveMedical}
                className="flex-1 bg-ink-700 hover:bg-ink-800"
              >
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {/* Done */}
            {isMedical && (
              <Action
                icon={<Check className="h-5 w-5" />}
                label="Mark done"
                tone="emerald"
                onClick={() => markMedical(false)}
              />
            )}
            {isCare && (
              <Action
                icon={<Check className="h-5 w-5" />}
                label="Mark done"
                tone="emerald"
                onClick={() => careDone(false)}
              />
            )}
            {isVitd && (
              <Action
                icon={<Droplets className="h-5 w-5" />}
                label="Mark given"
                tone="emerald"
                onClick={vitdGiven}
              />
            )}

            {/* Missed / skip */}
            {isMedical && (
              <Action
                icon={<CircleSlash className="h-5 w-5" />}
                label="Missed"
                tone="amber"
                onClick={() => markMedical(true)}
              />
            )}
            {isCare && (
              <Action
                icon={<CircleSlash className="h-5 w-5" />}
                label="Skip this time"
                tone="amber"
                onClick={() => careDone(true)}
              />
            )}

            {/* Edit */}
            {isMedical && (
              <Action
                icon={<Pencil className="h-5 w-5" />}
                label="Edit"
                tone="ink"
                onClick={() => setEditing(true)}
              />
            )}

            {/* Open where it lives */}
            {item.href && (
              <Action
                icon={<ExternalLink className="h-5 w-5" />}
                label="Open"
                tone="ink"
                onClick={open}
              />
            )}

            {/* Hear it */}
            {canSpeak && (
              <Action
                icon={<Volume2 className="h-5 w-5" />}
                label="Hear it"
                tone="gold"
                onClick={() =>
                  void speak(agendaSpeech(item, voicePrefs.patwahStrength))
                }
              />
            )}

            {/* Delete */}
            {isMedical && (
              <Action
                icon={<Trash2 className="h-5 w-5" />}
                label="Delete"
                tone="rose"
                onClick={deleteMedical}
              />
            )}
            {isCare && (
              <Action
                icon={<Trash2 className="h-5 w-5" />}
                label="Delete reminder"
                tone="rose"
                onClick={careDelete}
              />
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

const TONES: Record<string, string> = {
  emerald: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50',
  amber: 'border-amber-300 text-amber-700 hover:bg-amber-50',
  rose: 'border-rose-300 text-rose-600 hover:bg-rose-50',
  gold: 'border-gold-300 text-gold-700 hover:bg-gold-50',
  ink: 'border-ink-300 text-ink-700 hover:bg-parchment-100',
};

function Action({
  icon,
  label,
  tone,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  tone: keyof typeof TONES | string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border bg-parchment-50 px-3 py-2.5 text-sm font-medium transition-colors active:scale-[0.98] ${
        TONES[tone] ?? TONES.ink
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
