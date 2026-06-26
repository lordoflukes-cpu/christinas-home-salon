'use client';

import { EverydayTrends } from './everyday-trends';
import { LogList } from '../log-list';

/**
 * The "Everyday" section of the Timeline: the day/week/month trends visual on
 * top, then the full feeds/nappies/sleep history — each entry showing its exact
 * time, and tappable to edit or remove (via `LogList`). All on-device.
 */
export function EverydayView() {
  return (
    <div className="space-y-5">
      <EverydayTrends />
      <LogList />
    </div>
  );
}
