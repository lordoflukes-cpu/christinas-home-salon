'use client';

import { Card } from '@/components/ui/card';
import {
  useLeoStore,
  useNow,
  formatAge,
  ageInDays,
  formatDateTime,
} from '@/lib/leo';

export function AgeCard() {
  const profile = useLeoStore((s) => s.profile);
  const now = useNow(60_000);

  if (!profile) return null;

  const days = ageInDays(profile.birth, now);

  return (
    <Card className="border-rose-100 bg-gradient-to-br from-rose-50 to-cream-50 p-5 text-center">
      <p className="font-display text-3xl font-semibold text-rose-600">
        {formatAge(profile.birth, now)}
      </p>
      <p className="mt-1 text-sm text-sage-600">
        {days === 0
          ? 'Welcome to the world 💙'
          : `Day ${days} · born ${formatDateTime(profile.birth)}`}
      </p>
    </Card>
  );
}
