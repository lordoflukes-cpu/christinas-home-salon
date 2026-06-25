'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLeoStore } from '@/lib/leo';
import type {
  RoutineCategoryConfig,
  RoutineItem,
  RoutineRating,
} from '@/lib/leo';
import { cn } from '@/lib/utils';

const RATINGS: { value: RoutineRating; label: string; emoji: string }[] = [
  { value: 'works', label: 'Works', emoji: '💚' },
  { value: 'sometimes', label: 'Sometimes', emoji: '🤔' },
  { value: 'no', label: 'Nope', emoji: '🚫' },
];

const RATING_STYLES: Record<RoutineRating, string> = {
  works: 'border-emerald-500 bg-emerald-500 text-white',
  sometimes: 'border-amber-500 bg-amber-500 text-white',
  no: 'border-rose-400 bg-rose-400 text-white',
};

/** One routine category — its items plus an add row with suggestion chips. */
export function RoutineSection({ config }: { config: RoutineCategoryConfig }) {
  const allRoutines = useLeoStore((s) => s.routines);
  const createRoutine = useLeoStore((s) => s.createRoutine);
  const editRoutine = useLeoStore((s) => s.editRoutine);
  const removeRoutine = useLeoStore((s) => s.removeRoutine);
  const [draft, setDraft] = useState('');

  const items = useMemo(
    () =>
      allRoutines
        .filter((r) => r.category === config.category)
        .sort((a, b) => a.position - b.position),
    [allRoutines, config.category],
  );

  const usedTexts = new Set(items.map((i) => i.text.toLowerCase()));
  const freshSuggestions = config.suggestions.filter(
    (s) => !usedTexts.has(s.toLowerCase()),
  );

  function add(text: string) {
    const clean = text.trim();
    if (!clean) return;
    const nextPos = items.length
      ? Math.max(...items.map((i) => i.position)) + 1
      : 0;
    void createRoutine({
      category: config.category,
      text: clean,
      position: nextPos,
    });
  }

  function move(index: number, dir: -1 | 1) {
    const other = index + dir;
    if (other < 0 || other >= items.length) return;
    const a = items[index];
    const b = items[other];
    void editRoutine(a.id, { position: b.position });
    void editRoutine(b.id, { position: a.position });
  }

  function setRating(item: RoutineItem, rating: RoutineRating) {
    void editRoutine(item.id, {
      rating: item.rating === rating ? undefined : rating,
    });
  }

  return (
    <Card className="border-ink-300/40 p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="text-2xl leading-none">{config.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-tight text-ink-900">
            {config.title}
          </h3>
          <p className="text-xs text-ink-500">{config.description}</p>
        </div>
        {items.length > 0 && (
          <span className="shrink-0 rounded-full bg-parchment-100 px-2 py-0.5 text-xs font-medium text-ink-500">
            {items.length}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-xl border border-ink-300/40 bg-parchment-50/60 px-2.5 py-2"
            >
              {config.ordered ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-700 text-xs font-semibold text-parchment-50">
                  {i + 1}
                </span>
              ) : (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
              )}

              <span className="min-w-0 flex-1 truncate text-sm text-ink-900">
                {item.text}
              </span>

              {config.ordered && items.length > 1 && (
                <span className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="text-ink-400 transition-colors hover:text-ink-700 disabled:opacity-25"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                    className="text-ink-400 transition-colors hover:text-ink-700 disabled:opacity-25"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </span>
              )}

              {config.rateable && (
                <span className="flex shrink-0 gap-1">
                  {RATINGS.map((r) => {
                    const active = item.rating === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        aria-label={r.label}
                        aria-pressed={active}
                        title={r.label}
                        onClick={() => setRating(item, r.value)}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full border text-sm transition-all active:scale-90',
                          active
                            ? RATING_STYLES[r.value]
                            : 'border-ink-300 bg-parchment-50 opacity-50 hover:opacity-100',
                        )}
                      >
                        {r.emoji}
                      </button>
                    );
                  })}
                </span>
              )}

              <button
                type="button"
                aria-label="Delete"
                onClick={() => removeRoutine(item.id)}
                className="shrink-0 text-ink-300 transition-colors hover:text-rose-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {freshSuggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {freshSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-dashed border-ink-300 bg-parchment-50 px-2.5 py-1 text-xs font-medium text-ink-600 transition-colors hover:border-gold-400 hover:bg-parchment-100"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add(draft);
          setDraft('');
        }}
        className="flex gap-2"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={config.placeholder}
          className="h-9 flex-1 text-sm"
        />
        <Button
          type="submit"
          size="icon"
          variant="secondary"
          disabled={!draft.trim()}
          aria-label="Add"
          className="h-9 w-9 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
