import {
  ProfileEditor,
  BackupPanel,
  InstallPrompt,
  SectionBanner,
} from '@/components/leo';
import { BackdropsPanel } from '@/components/leo/backdrops-panel';
import { SyncPanel } from '@/components/leo/cloud/sync-panel';
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
