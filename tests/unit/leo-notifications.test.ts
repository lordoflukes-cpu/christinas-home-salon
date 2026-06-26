import { describe, it, expect } from 'vitest';
import {
  notificationChecklist,
  type ChainState,
} from '@/lib/leo/notifications';

const READY: ChainState = {
  supported: true,
  pushSupported: true,
  permission: 'granted',
  pushConfigured: true,
  signedIn: true,
  subscribedThisDevice: true,
};

describe('notificationChecklist', () => {
  it('marks every link ok when fully set up', () => {
    const items = notificationChecklist(READY);
    expect(items).toHaveLength(5);
    expect(items.every((i) => i.ok)).toBe(true);
  });

  it('flags an unsupported device with a Home Screen hint', () => {
    const items = notificationChecklist({
      ...READY,
      supported: false,
      pushSupported: false,
    });
    expect(items[0].ok).toBe(false);
    expect(items[0].hint).toMatch(/home screen/i);
  });

  it('explains a blocked permission', () => {
    const items = notificationChecklist({ ...READY, permission: 'denied' });
    const perm = items.find((i) => i.label.includes('allowed'))!;
    expect(perm.ok).toBe(false);
    expect(perm.hint).toMatch(/blocked/i);
  });

  it('flags missing cloud configuration', () => {
    const items = notificationChecklist({ ...READY, pushConfigured: false });
    const cloud = items.find((i) => i.label.includes('Closed-app'))!;
    expect(cloud.ok).toBe(false);
    expect(cloud.hint).toMatch(/setup/i);
  });

  it('flags a signed-out account and an unsubscribed device', () => {
    const items = notificationChecklist({
      ...READY,
      signedIn: false,
      subscribedThisDevice: false,
    });
    expect(items.find((i) => i.label.includes('Signed in'))!.ok).toBe(false);
    expect(items.find((i) => i.label.includes('subscribed'))!.ok).toBe(false);
  });
});
