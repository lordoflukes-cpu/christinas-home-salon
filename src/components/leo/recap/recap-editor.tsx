'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLeoStore } from '@/lib/leo';
import type {
  AutoRecap,
  MonthlyRecap,
  PhotoEntry,
  RecapInput,
} from '@/lib/leo';
import { cn } from '@/lib/utils';
import { PhotoImage } from '../photos/photo-image';

export function RecapEditor({
  monthIndex,
  saved,
  auto,
  monthPhotos,
  onDone,
}: {
  monthIndex: number;
  saved: MonthlyRecap | undefined;
  auto: AutoRecap;
  monthPhotos: PhotoEntry[];
  onDone: () => void;
}) {
  const saveRecap = useLeoStore((s) => s.saveRecap);
  const [busy, setBusy] = useState(false);

  const [favouriteThing, setFavouriteThing] = useState(
    saved?.favouriteThing ?? '',
  );
  const [newSkill, setNewSkill] = useState(saved?.newSkill ?? '');
  const [funniest, setFunniest] = useState(saved?.funniest ?? '');
  const [hardest, setHardest] = useState(saved?.hardest ?? '');
  const [messageFromDad, setDad] = useState(saved?.messageFromDad ?? '');
  const [messageFromMum, setMum] = useState(saved?.messageFromMum ?? '');
  const [placesVisited, setPlaces] = useState(saved?.placesVisited ?? '');
  const [peopleMet, setPeople] = useState(saved?.peopleMet ?? '');
  const [neverForget, setNeverForget] = useState(saved?.neverForget ?? '');
  const [bestPhotoId, setBestPhotoId] = useState<string | undefined>(
    saved?.bestPhotoId ?? auto.bestPhotoId,
  );

  const clean = (v: string) => (v.trim() ? v.trim() : undefined);

  async function submit() {
    setBusy(true);
    try {
      const patch: RecapInput = {
        favouriteThing: clean(favouriteThing),
        newSkill: clean(newSkill),
        funniest: clean(funniest),
        hardest: clean(hardest),
        messageFromDad: clean(messageFromDad),
        messageFromMum: clean(messageFromMum),
        placesVisited: clean(placesVisited),
        peopleMet: clean(peopleMet),
        neverForget: clean(neverForget),
        bestPhotoId,
      };
      await saveRecap(monthIndex, patch);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-h-[80vh] space-y-4 overflow-y-auto pb-2">
      {auto.weight && (
        <p className="rounded-xl bg-parchment-100/70 px-3 py-2 text-sm text-ink-600">
          ⚖️ Weight this month:{' '}
          <span className="font-medium text-ink-900">{auto.weight}</span>{' '}
          <span className="text-ink-400">(from growth)</span>
        </p>
      )}

      {monthPhotos.length > 0 && (
        <div className="space-y-1.5">
          <Label>Best photo</Label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {monthPhotos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setBestPhotoId(bestPhotoId === p.id ? undefined : p.id)
                }
                className={cn(
                  'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition-all',
                  bestPhotoId === p.id
                    ? 'ring-gold-500'
                    : 'ring-transparent hover:ring-ink-300',
                )}
              >
                <PhotoImage
                  bytes={p.bytes}
                  type={p.type}
                  className="h-full w-full object-cover"
                />
                {bestPhotoId === p.id && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <Field label="Favourite thing">
        <Input
          value={favouriteThing}
          onChange={(e) => setFavouriteThing(e.target.value)}
          placeholder="What did Leo love most?"
        />
      </Field>

      <Field label="New skill" hint={auto.newSkill}>
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder={auto.newSkill ?? 'Something new he learned'}
        />
      </Field>

      <Field label="Funniest moment" hint={auto.funniest}>
        <Textarea
          rows={2}
          value={funniest}
          onChange={(e) => setFunniest(e.target.value)}
          placeholder={auto.funniest ?? 'The thing that made you laugh'}
        />
      </Field>

      <Field label="Hardest moment" hint={auto.hardest}>
        <Textarea
          rows={2}
          value={hardest}
          onChange={(e) => setHardest(e.target.value)}
          placeholder={auto.hardest ?? 'The tougher days'}
        />
      </Field>

      <Field label="Message from Dad" hint={auto.messageFromDad}>
        <Textarea
          rows={2}
          value={messageFromDad}
          onChange={(e) => setDad(e.target.value)}
          placeholder={auto.messageFromDad ?? 'A few words from Daddy…'}
          className="font-serif"
        />
      </Field>

      <Field label="Message from Mum" hint={auto.messageFromMum}>
        <Textarea
          rows={2}
          value={messageFromMum}
          onChange={(e) => setMum(e.target.value)}
          placeholder={auto.messageFromMum ?? 'A few words from Mummy…'}
          className="font-serif"
        />
      </Field>

      <Field label="Places visited" hint={auto.placesVisited}>
        <Input
          value={placesVisited}
          onChange={(e) => setPlaces(e.target.value)}
          placeholder={auto.placesVisited ?? 'Where did you go together?'}
        />
      </Field>

      <Field label="People met" hint={auto.peopleMet}>
        <Input
          value={peopleMet}
          onChange={(e) => setPeople(e.target.value)}
          placeholder={auto.peopleMet ?? 'Who did Leo meet?'}
        />
      </Field>

      <Field label="Things we never want to forget">
        <Textarea
          rows={3}
          value={neverForget}
          onChange={(e) => setNeverForget(e.target.value)}
          placeholder="The little things to keep forever…"
          className="font-serif"
        />
      </Field>

      <Button
        onClick={submit}
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        Save Month {monthIndex}
      </Button>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && (
        <p className="text-xs text-ink-400">
          Suggested from your logs — leave blank to use it.
        </p>
      )}
    </div>
  );
}
