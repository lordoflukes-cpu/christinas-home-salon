import { LogList } from '@/components/leo';

export default function LeoLogPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-night-900">
        History
      </h1>
      <LogList />
    </div>
  );
}
