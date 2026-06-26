import { SectionBanner } from '@/components/leo';
import { TimelineView } from '@/components/leo/timeline/timeline-view';

export default function LeoTimelinePage() {
  return (
    <div className="space-y-4">
      <SectionBanner
        title="Timeline"
        subtitle="Leo's story, moment by moment"
        index={0}
      />
      <TimelineView />
    </div>
  );
}
