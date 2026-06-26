import { describe, it, expect } from 'vitest';
import { parseActions, actionArea } from '@/lib/leo/report-actions';

describe('parseActions', () => {
  it('parses a mixed batch of actions', () => {
    const out = parseActions(
      JSON.stringify({
        actions: [
          { type: 'profile', summary: 'Set GP', fields: { gp: 'Dr Patel' } },
          {
            type: 'medical',
            summary: '8-week check',
            medicalKind: 'note',
            title: '8-week check',
            when: '2026-06-20',
          },
          {
            type: 'event',
            summary: 'Rash, mild',
            eventKind: 'symptom',
            symptom: 'rash',
            severity: 'mild',
          },
          { type: 'reminders', summary: 'Feed every 3h', feedHours: 3 },
        ],
      }),
    );
    expect(out?.actions).toHaveLength(4);
    expect(out?.actions[0].fields?.gp).toBe('Dr Patel');
    expect(out?.actions[3].feedHours).toBe(3);
  });

  it('strips ```json fences', () => {
    const out = parseActions(
      '```json\n{"actions":[{"type":"note","summary":"Note","body":"hi"}]}\n```',
    );
    expect(out?.actions[0].type).toBe('note');
  });

  it('accepts an empty list', () => {
    expect(parseActions('{"actions":[]}')).toEqual({ actions: [] });
  });

  it('salvages the valid actions and drops only the invalid ones', () => {
    const out = parseActions(
      JSON.stringify({
        actions: [
          { type: 'note', summary: 'Keep me', body: 'ok' },
          { type: 'spaceship', summary: 'unknown type' },
          {
            type: 'event',
            eventKind: 'temperature',
            tempC: 99,
            summary: 'bad temp',
          },
          { type: 'feed', summary: 'Bottle', feedType: 'bottle', amountMl: 90 },
        ],
      }),
    );
    expect(out?.actions).toHaveLength(2);
    expect(out?.actions.map((a) => a.type)).toEqual(['note', 'feed']);
  });

  it('extracts JSON even when wrapped in prose', () => {
    const out = parseActions(
      'Sure! Here are the actions I found:\n{"actions":[{"type":"note","summary":"Hi","body":"x"}]}\nLet me know if that helps.',
    );
    expect(out?.actions).toHaveLength(1);
    expect(out?.actions[0].type).toBe('note');
  });

  it('accepts a bare array (no actions wrapper)', () => {
    const out = parseActions(
      '[{"type":"milestone","summary":"First smile","title":"First smile"}]',
    );
    expect(out?.actions).toHaveLength(1);
    expect(out?.actions[0].type).toBe('milestone');
  });

  it('keeps a long medical note that used to overflow the old cap', () => {
    const out = parseActions(
      JSON.stringify({
        actions: [
          {
            type: 'medical',
            medicalKind: 'note',
            summary: 'NIPE newborn examination — all systems normal',
            title: 'Newborn examination (NIPE)',
            note: 'x'.repeat(900),
          },
        ],
      }),
    );
    expect(out?.actions).toHaveLength(1);
  });

  it('recovers complete actions from a reply truncated mid-JSON', () => {
    // Two full objects, then a third cut off at the token limit (no closing).
    const truncated =
      '{"actions":[' +
      '{"type":"profile","summary":"Profile","fields":{"name":"Leo","gp":"Old Court House Surgery"}},' +
      '{"type":"medical","medicalKind":"note","summary":"NIPE","title":"Newborn examination"},' +
      '{"type":"event","eventKind":"symptom","summary":"Rash","sympt';
    const out = parseActions(truncated);
    expect(out?.actions).toHaveLength(2);
    expect(out?.actions[0].fields?.name).toBe('Leo');
    expect(out?.actions[1].medicalKind).toBe('note');
  });

  it('returns null for non-JSON', () => {
    expect(parseActions('sorry, no idea')).toBeNull();
  });

  it('caps the number of actions', () => {
    const many = Array.from({ length: 40 }, () => ({
      type: 'note',
      summary: 'n',
      body: 'x',
    }));
    expect(
      parseActions(JSON.stringify({ actions: many }))?.actions,
    ).toHaveLength(30);
  });
});

describe('actionArea', () => {
  it('routes each action to a readable area', () => {
    expect(actionArea({ type: 'profile', summary: 'x' })).toBe('Profile');
    expect(
      actionArea({ type: 'medical', medicalKind: 'note', summary: 'x' }),
    ).toBe('Red book');
    expect(
      actionArea({ type: 'medical', medicalKind: 'appointment', summary: 'x' }),
    ).toBe('Health');
    expect(actionArea({ type: 'event', summary: 'x' })).toBe('Health');
    expect(actionArea({ type: 'reminders', summary: 'x' })).toBe('Reminders');
    expect(actionArea({ type: 'feed', summary: 'x' })).toBe('Daily log');
  });
});
