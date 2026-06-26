import Link from 'next/link';
import type { Route } from 'next';
import { Sparkles } from 'lucide-react';
import {
  ProfileEditor,
  BackupPanel,
  InstallPrompt,
  SectionBanner,
} from '@/components/leo';
import { BackdropsPanel } from '@/components/leo/backdrops-panel';
import { SyncPanel } from '@/components/leo/cloud/sync-panel';
import { NotificationsPanel } from '@/components/leo/cloud/notifications-panel';
import { RemindersPanel } from '@/components/leo/cloud/reminders-panel';
import { HeritageThread } from '@/components/leo/decor/heritage-thread';

export default function LeoSettingsPage() {
  return (
    <div className="space-y-4">
      <SectionBanner
        title="Settings"
        subtitle="Leo's details & keepsake backup"
        index={3}
      />
      <InstallPrompt />
      <ProfileEditor />
      <SyncPanel />
      <NotificationsPanel />
      <RemindersPanel />

      <Link
        href={'/leo/ask' as Route}
        className="flex items-center gap-3 rounded-2xl border border-gold-300/40 bg-parchment-50/90 p-4 transition-colors hover:bg-parchment-100"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-display text-base text-ink-900">Ask Leo</p>
          <p className="text-xs text-ink-500">
            AI summaries, doctor notes &amp; family updates from your logs
          </p>
        </div>
      </Link>

      <BackdropsPanel />
      <BackupPanel />

      <footer className="flex flex-col items-center gap-2 pt-2 text-center">
        <HeritageThread />
        <p className="text-xs text-parchment-200/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
          Made with love for Leo — Greek-Cypriot, Nigerian &amp; British. 🦁
        </p>
      </footer>
    </div>
  );
}
