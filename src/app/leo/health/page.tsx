'use client';

import { useState } from 'react';
import { Segmented } from '@/components/leo/forms/feed-form';
import { GrowthSection } from '@/components/leo/growth/growth-section';
import { MedicalSection } from '@/components/leo/medical/medical-section';

export default function LeoHealthPage() {
  const [tab, setTab] = useState<'growth' | 'medical'>('growth');
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-night-900">
        Health
      </h1>
      <Segmented
        value={tab}
        onChange={(v) => setTab(v as 'growth' | 'medical')}
        options={[
          { value: 'growth', label: 'Growth' },
          { value: 'medical', label: 'Medical' },
        ]}
      />
      {tab === 'growth' ? <GrowthSection /> : <MedicalSection />}
    </div>
  );
}
