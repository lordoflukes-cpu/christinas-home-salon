import { describe, it, expect } from 'vitest';
import { shouldApplyRemote } from '@/lib/leo/sync';

describe('shouldApplyRemote', () => {
  it('applies when there is no local copy', () => {
    expect(shouldApplyRemote(1000, undefined)).toBe(true);
  });

  it('applies when the remote is newer', () => {
    expect(shouldApplyRemote(2000, 1000)).toBe(true);
  });

  it('applies on a tie (remote wins for determinism)', () => {
    expect(shouldApplyRemote(1000, 1000)).toBe(true);
  });

  it('does not apply when the local copy is newer', () => {
    expect(shouldApplyRemote(1000, 2000)).toBe(false);
  });
});
