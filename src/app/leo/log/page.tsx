import { LogList, SectionBanner } from '@/components/leo';

export default function LeoLogPage() {
  return (
    <div className="space-y-4">
      <SectionBanner
        title="History"
        subtitle="Feeds, nappies & sleep"
        index={0}
      />
      <LogList />
    </div>
  );
}
