'use client';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Check, ListChecks } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  useLeoStore,
  useNow,
  buildAgenda,
  relativeDue,
  type AgendaItem,
} from '@/lib/leo';
import { DEFAULT_REMINDER_PREFS } from '@/lib/leo/reminders';
import { cn } from '@/lib/utils';
import { BottlePrepTimer } from '../reminders/bottle-prep-timer';

const MAX_SHOWN = 5;

export function AgendaCard() {
  const profile = useLeoStore((s) => s.profile);
  const feeds = useLeoStore((s) => s.feeds);
  const medical = useLeoStore((s) => s.medical);
  const activeSleep = useLeoStore((s) => s.activeSleep);
  const careTasks = useLeoStore((s) => s.careTasks);
  const markCareDone = useLeoStore((s) => s.markCareDone);
  const now = useNow(60_000);
  const router = useRouter();

  const items = buildAgenda({
    prefs: profile?.reminders ?? DEFAULT_REMINDER_PREFS,
    feeds,
    medical,
    activeSleep,
    careTasks,
    now,
  });

  const shown = items.slice(0, MAX_SHOWN);
  const extra = items.length - shown.length;

  return (
    <Card className="border-ink-300/40 p-4">
      <div className="mb-2 flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-gold-600" />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Coming up
        </h2>
      </div>

      {shown.length === 0 ? (
        <p className="py-3 text-center text-sm text-ink-500">
          All caught up ✨
        </p>
      ) : (
        <ul className="space-y-1">
          {shown.map((item) => (
            <AgendaRow
              key={item.key}
              item={item}
              now={now}
              onTick={
                item.careTaskId
                  ? () => void markCareDone(item.careTaskId!)
                  : undefined
              }
              onOpen={
                item.href ? () => router.push(item.href as Route) : undefined
              }
            />
          ))}
        </ul>
      )}

      {extra > 0 && (
        <p className="mt-1 text-center text-xs text-ink-400">+{extra} more</p>
      )}

      <div className="mt-3 border-t border-ink-300/40 pt-3">
        <BottlePrepTimer />
      </div>
    </Card>
  );
}

function AgendaRow({
  item,
  now,
  onTick,
  onOpen,
}: {
  item: AgendaItem;
  now: number;
  onTick?: () => void;
  onOpen?: () => void;
}) {
  const due = relativeDue(item.dueAt, now);
  return (
    <li className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors',
          onOpen ? 'hover:bg-parchment-100' : 'cursor-default',
        )}
      >
        <span className="text-xl leading-none">{item.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink-900">
            {item.title}
          </span>
          {item.subtitle && (
            <span className="block truncate text-xs text-ink-500">
              {item.subtitle}
            </span>
          )}
        </span>
        <span
          className={cn(
            'shrink-0 text-xs font-medium',
            item.overdue ? 'text-rose-500' : 'text-ink-400',
          )}
        >
          {due}
        </span>
      </button>

      {onTick && (
        <button
          type="button"
          onClick={onTick}
          aria-label={`Mark ${item.title} done`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-300 text-emerald-600 transition-colors hover:bg-emerald-50 active:scale-90"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}
