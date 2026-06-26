import { describe, it, expect } from 'vitest';
import { parseEntries } from '@/lib/leo/log-parse';

describe('parseEntries (voice → auto-log validation)', () => {
  it('parses a clean entries object', () => {
    const out = parseEntries(
      '{"entries":[{"kind":"feed","feedType":"bottle","amountMl":90,"contents":"formula","summary":"Bottle feed · 90ml"}]}',
    );
    expect(out?.entries).toHaveLength(1);
    expect(out?.entries[0]).toMatchObject({ kind: 'feed', amountMl: 90 });
  });

  it('strips ```json fences', () => {
    const out = parseEntries(
      '```json\n{"entries":[{"kind":"diaper","diaperType":"dirty","summary":"Dirty nappy"}]}\n```',
    );
    expect(out?.entries[0]).toMatchObject({
      kind: 'diaper',
      diaperType: 'dirty',
    });
  });

  it('accepts an empty entries list', () => {
    expect(parseEntries('{"entries":[]}')).toEqual({ entries: [] });
  });

  it('returns null for non-JSON', () => {
    expect(parseEntries('sorry, I did not understand')).toBeNull();
  });

  it('returns null when an entry has an unknown kind', () => {
    expect(
      parseEntries('{"entries":[{"kind":"spaceship","summary":"nope"}]}'),
    ).toBeNull();
  });

  it('returns null when a required summary is missing', () => {
    expect(parseEntries('{"entries":[{"kind":"sleep"}]}')).toBeNull();
  });

  it('rejects an out-of-range temperature', () => {
    expect(
      parseEntries(
        '{"entries":[{"kind":"event","eventKind":"temperature","tempC":99,"summary":"Temp"}]}',
      ),
    ).toBeNull();
  });

  it('caps the number of entries at 8', () => {
    const many = Array.from({ length: 9 }, () => ({
      kind: 'note',
      body: 'x',
      summary: 'Note',
    }));
    expect(parseEntries(JSON.stringify({ entries: many }))).toBeNull();
  });
});
