'use client';

import { useMemo, useState } from 'react';
import {
  Brain,
  Pin,
  PinOff,
  Trash2,
  Plus,
  Search,
  Check,
  X,
  Pencil,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useLeoStore,
  rankMemories,
  categoryLabel,
  isSafetyCritical,
  type Memory,
  type MemoryCategory,
} from '@/lib/leo';

const CATEGORIES: { value: MemoryCategory; label: string }[] = [
  { value: 'health', label: 'Health' },
  { value: 'allergy', label: 'Allergy' },
  { value: 'preference', label: 'Preference' },
  { value: 'routine', label: 'Routine' },
  { value: 'person', label: 'Person' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'fact', label: 'Fact' },
  { value: 'note', label: 'Note' },
];

/** Order categories so safety-critical groups sit at the top. */
const GROUP_ORDER: MemoryCategory[] = [
  'health',
  'allergy',
  'preference',
  'routine',
  'person',
  'milestone',
  'fact',
  'note',
];

export function SecondBrain() {
  const memories = useLeoStore((s) => s.memories);
  const createMemory = useLeoStore((s) => s.createMemory);
  const editMemory = useLeoStore((s) => s.editMemory);
  const removeMemory = useLeoStore((s) => s.removeMemory);

  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const live = useMemo(
    () => memories.filter((m) => !m.supersededBy),
    [memories],
  );

  // When searching, rank by relevance; otherwise group by category.
  const ranked = useMemo(() => {
    if (!query.trim()) return null;
    return rankMemories(live, query, { topN: 50 }).map((r) => r.memory);
  }, [query, live]);

  const grouped = useMemo(() => {
    const map = new Map<MemoryCategory, Memory[]>();
    for (const m of live) {
      const arr = map.get(m.category) ?? [];
      arr.push(m);
      map.set(m.category, arr);
    }
    for (const arr of Array.from(map.values())) {
      arr.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.importance - a.importance || b.createdAt - a.createdAt;
      });
    }
    return map;
  }, [live]);

  return (
    <div className="space-y-4">
      <Card className="border-gold-300/50 bg-gold-50/40 p-4">
        <p className="flex items-center gap-2 font-serif text-lg text-ink-800">
          <Brain className="h-5 w-5 text-gold-600" /> Leo’s Second Brain
        </p>
        <p className="mt-1 text-sm text-ink-600">
          Everything Leo remembers about your little one — built up from your
          chats and what you teach him. He leans on these to give better, more
          personal answers. Health &amp; allergy facts are always kept.
        </p>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-ink-300 bg-white px-3">
        <Search className="h-4 w-4 shrink-0 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memories…"
          className="min-h-11 flex-1 bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-ink-400 hover:text-ink-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Teach Leo */}
      {adding ? (
        <MemoryEditor
          onCancel={() => setAdding(false)}
          onSave={async (draft) => {
            await createMemory({
              text: draft.text,
              category: draft.category,
              tags: draft.tags,
              importance: draft.importance,
              trust: 1,
              source: 'user',
              pinned: draft.pinned,
              useCount: 0,
            });
            setAdding(false);
          }}
        />
      ) : (
        <Button
          type="button"
          onClick={() => setAdding(true)}
          variant="outline"
          className="w-full border-dashed border-gold-300 bg-gold-50/40 text-gold-800 hover:bg-gold-100"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Teach Leo something
        </Button>
      )}

      {/* Results */}
      {live.length === 0 && !adding && (
        <p className="py-8 text-center text-sm text-ink-500">
          No memories yet. Chat with Leo, or teach him something above — he’ll
          remember it here.
        </p>
      )}

      {ranked ? (
        <div className="space-y-2">
          {ranked.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-500">
              No memories match “{query}”.
            </p>
          )}
          {ranked.map((m) =>
            editingId === m.id ? (
              <MemoryEditor
                key={m.id}
                initial={m}
                onCancel={() => setEditingId(null)}
                onSave={async (draft) => {
                  await editMemory(m.id, draft);
                  setEditingId(null);
                }}
              />
            ) : (
              <MemoryRow
                key={m.id}
                memory={m}
                onEdit={() => setEditingId(m.id)}
                onTogglePin={() => void editMemory(m.id, { pinned: !m.pinned })}
                onDelete={() => void removeMemory(m.id)}
              />
            ),
          )}
        </div>
      ) : (
        GROUP_ORDER.filter((c) => grouped.get(c)?.length).map((cat) => (
          <div key={cat} className="space-y-2">
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-wide',
                cat === 'health' || cat === 'allergy'
                  ? 'text-rose-500'
                  : 'text-ink-400',
              )}
            >
              {categoryLabel(cat)}
            </p>
            {grouped.get(cat)!.map((m) =>
              editingId === m.id ? (
                <MemoryEditor
                  key={m.id}
                  initial={m}
                  onCancel={() => setEditingId(null)}
                  onSave={async (draft) => {
                    await editMemory(m.id, draft);
                    setEditingId(null);
                  }}
                />
              ) : (
                <MemoryRow
                  key={m.id}
                  memory={m}
                  onEdit={() => setEditingId(m.id)}
                  onTogglePin={() =>
                    void editMemory(m.id, { pinned: !m.pinned })
                  }
                  onDelete={() => void removeMemory(m.id)}
                />
              ),
            )}
          </div>
        ))
      )}
    </div>
  );
}

function MemoryRow({
  memory: m,
  onEdit,
  onTogglePin,
  onDelete,
}: {
  memory: Memory;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const critical = isSafetyCritical(m);
  return (
    <div
      className={cn(
        'rounded-xl border p-3',
        critical
          ? 'border-rose-300/70 bg-rose-50/50'
          : 'border-ink-300/40 bg-parchment-50',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[15px] leading-relaxed text-ink-800">
          {critical && <span className="mr-1 text-rose-500">★</span>}
          {m.text}
        </p>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onTogglePin}
            aria-label={m.pinned ? 'Unpin' : 'Pin'}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              m.pinned
                ? 'text-gold-600 hover:bg-gold-100'
                : 'text-ink-400 hover:bg-parchment-100 hover:text-ink-600',
            )}
          >
            {m.pinned ? (
              <Pin className="h-4 w-4" />
            ) : (
              <PinOff className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit"
            className="rounded-md p-1.5 text-ink-400 hover:bg-parchment-100 hover:text-ink-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Forget"
            className="rounded-md p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-400">
        <span className="rounded-full bg-parchment-100 px-2 py-0.5">
          {categoryLabel(m.category)}
        </span>
        <span>importance {m.importance}</span>
        {m.source === 'user' && <span>· you taught this</span>}
        {m.tags.slice(0, 4).map((t) => (
          <span key={t} className="text-ink-400">
            #{t}
          </span>
        ))}
      </div>
    </div>
  );
}

interface Draft {
  text: string;
  category: MemoryCategory;
  importance: number;
  tags: string[];
  pinned: boolean;
}

function MemoryEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Memory;
  onSave: (draft: Draft) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial?.text ?? '');
  const [category, setCategory] = useState<MemoryCategory>(
    initial?.category ?? 'fact',
  );
  const [importance, setImportance] = useState(initial?.importance ?? 5);
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(', '));
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!text.trim() || busy) return;
    setBusy(true);
    await onSave({
      text: text.trim(),
      category,
      importance,
      pinned,
      tags: tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setBusy(false);
  }

  return (
    <Card className="border-gold-300/60 bg-white p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="e.g. Leo settles best with white noise"
        className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-[15px] text-ink-900 outline-none focus:border-gold-400"
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as MemoryCategory)}
          className="min-h-10 rounded-lg border border-ink-300 bg-white px-2 text-sm text-ink-800"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          Importance
          <input
            type="number"
            min={1}
            max={10}
            value={importance}
            onChange={(e) =>
              setImportance(
                Math.max(1, Math.min(10, Number(e.target.value) || 1)),
              )
            }
            className="min-h-10 w-16 rounded-lg border border-ink-300 bg-white px-2 text-sm text-ink-800"
          />
        </label>
      </div>
      <input
        value={tagsText}
        onChange={(e) => setTagsText(e.target.value)}
        placeholder="tags, comma separated"
        className="mt-2 min-h-10 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm text-ink-800 outline-none focus:border-gold-400"
      />
      <label className="mt-2 flex items-center gap-2 text-sm text-ink-600">
        <input
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
        />
        Pin (always remembered, never forgotten)
      </label>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void save()}
          disabled={!text.trim() || busy}
          className="h-9 bg-ink-700 hover:bg-ink-800"
        >
          <Check className="mr-1 h-4 w-4" /> Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="h-9 border-ink-300"
        >
          <X className="mr-1 h-4 w-4" /> Cancel
        </Button>
      </div>
    </Card>
  );
}
