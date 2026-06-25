import { ProfileEditor, BackupPanel, InstallPrompt } from '@/components/leo';

export default function LeoSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-sage-900">
        Settings
      </h1>
      <InstallPrompt />
      <ProfileEditor />
      <BackupPanel />
    </div>
  );
}
