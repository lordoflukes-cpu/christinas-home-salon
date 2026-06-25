import {
  ProfileEditor,
  BackupPanel,
  InstallPrompt,
  SectionBanner,
} from '@/components/leo';
import { HeritageThread } from '@/components/leo/decor/heritage-thread';

export default function LeoSettingsPage() {
  return (
    <div className="space-y-4">
      <SectionBanner
        title="Settings"
        subtitle="Leo's details & keepsake backup"
        variant="night"
        showConstellation
      />
      <InstallPrompt />
      <ProfileEditor />
      <BackupPanel />

      <footer className="flex flex-col items-center gap-2 pt-2 text-center">
        <HeritageThread />
        <p className="text-xs text-ink-500">
          Made with love for Leo — Greek-Cypriot, Nigerian &amp; British. 🦁
        </p>
      </footer>
    </div>
  );
}
