'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionBanner } from '@/components/leo';
import { Segmented } from '@/components/leo/forms/feed-form';
import { PhotoGallery } from '@/components/leo/photos/photo-gallery';
import { MilestoneList } from '@/components/leo/milestones/milestone-list';
import { JournalList } from '@/components/leo/journal/journal-list';
import { VoiceList } from '@/components/leo/voice/voice-list';

type Tab = 'photos' | 'milestones' | 'journal' | 'voice';

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
          { value: 'voice', label: 'Voice' },
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
          {tab === 'voice' && <VoiceList />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
