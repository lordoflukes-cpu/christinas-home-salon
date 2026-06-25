'use client';

import { useState } from 'react';
import { Segmented } from '@/components/leo/forms/feed-form';
import { PhotoGallery } from '@/components/leo/photos/photo-gallery';
import { MilestoneList } from '@/components/leo/milestones/milestone-list';
import { JournalList } from '@/components/leo/journal/journal-list';

type Tab = 'photos' | 'milestones' | 'journal';

export default function LeoMemoriesPage() {
  const [tab, setTab] = useState<Tab>('photos');
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-night-900">
        Memories
      </h1>
      <Segmented
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        options={[
          { value: 'photos', label: 'Photos' },
          { value: 'milestones', label: 'Firsts' },
          { value: 'journal', label: 'Letters' },
        ]}
      />
      {tab === 'photos' && <PhotoGallery />}
      {tab === 'milestones' && <MilestoneList />}
      {tab === 'journal' && <JournalList />}
    </div>
  );
}
