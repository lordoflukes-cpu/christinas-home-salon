import { ProfileEditor, BackupPanel, InstallPrompt } from '@/components/leo';
import { HeritageThread } from '@/components/leo/decor/heritage-thread';

export default function LeoSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-night-900">
        Settings
      </h1>
      <InstallPrompt />
      <ProfileEditor />
      <BackupPanel />

      <footer className="flex flex-col items-center gap-2 pt-2 text-center">
        <HeritageThread />
        <p className="text-xs text-sage-500">
          Made with love for Leo — Greek-Cypriot, Nigerian &amp; British. 🦁
        </p>
      </footer>
    </div>
  );
}
