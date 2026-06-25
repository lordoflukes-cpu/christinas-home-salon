'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionBanner } from '@/components/leo';
import { Segmented } from '@/components/leo/forms/feed-form';
import { GrowthSection } from '@/components/leo/growth/growth-section';
import { MedicalSection } from '@/components/leo/medical/medical-section';
import { DocumentsSection } from '@/components/leo/medical/documents-section';

type Tab = 'growth' | 'medical' | 'records';

export default function LeoHealthPage() {
  const [tab, setTab] = useState<Tab>('growth');
  return (
    <div className="space-y-4">
      <SectionBanner
        title="Health"
        subtitle="Growth, medical & records"
        index={1}
      />
      <Segmented
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        options={[
          { value: 'growth', label: 'Growth' },
          { value: 'medical', label: 'Medical' },
          { value: 'records', label: 'Records' },
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
          {tab === 'growth' && <GrowthSection />}
          {tab === 'medical' && <MedicalSection />}
          {tab === 'records' && <DocumentsSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
