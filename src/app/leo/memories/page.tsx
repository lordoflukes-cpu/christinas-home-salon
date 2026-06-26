'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
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

      <Link href={'/leo/recap' as Route}>
        <Card className="flex items-center gap-3 border-gold-200 bg-gradient-to-br from-gold-50 to-parchment-50 p-4 transition-colors hover:from-gold-100">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg text-ink-900">Monthly recap</p>
            <p className="text-xs text-ink-500">
              Leo, month by month — a keepsake book in the making
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-gold-500" />
        </Card>
      </Link>

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
