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

  it('returns null for an unknown type', () => {
    expect(
      parseActions('{"actions":[{"type":"spaceship","summary":"x"}]}'),
    ).toBeNull();
  });

  it('returns null for an out-of-range temperature', () => {
    expect(
      parseActions(
        '{"actions":[{"type":"event","eventKind":"temperature","tempC":99,"summary":"t"}]}',
      ),
    ).toBeNull();
  });

  it('returns null for non-JSON', () => {
    expect(parseActions('sorry, no idea')).toBeNull();
  });

  it('caps at 20 actions', () => {
    const many = Array.from({ length: 21 }, () => ({
      type: 'note',
      summary: 'n',
      body: 'x',
    }));
    expect(parseActions(JSON.stringify({ actions: many }))).toBeNull();
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
