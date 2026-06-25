'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionBanner } from '@/components/leo';
import { Segmented } from '@/components/leo/forms/feed-form';
import { PhotoGallery } from '@/components/leo/photos/photo-gallery';
import { MilestoneList } from '@/components/leo/milestones/milestone-list';
import { JournalList } from '@/components/leo/journal/journal-list';

type Tab = 'photos' | 'milestones' | 'journal';

export default function LeoMemoriesPage() {
  const [tab, setTab] = useState<Tab>('photos');
  return (
    <div className="space-y-4">
      <SectionBanner
        title="Memories"
        subtitle="Photos, firsts & letters"
        index={2}
      />
      <Segmented
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        options={[
          { value: 'photos', label: 'Photos' },
          { value: 'milestones', label: 'Firsts' },
          { value: 'journal', label: 'Letters' },
        ]}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'photos' && <PhotoGallery />}
          {tab === 'milestones' && <MilestoneList />}
          {tab === 'journal' && <JournalList />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
