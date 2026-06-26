import { SectionBanner } from '@/components/leo';
import { RecapBook } from '@/components/leo/recap/recap-book';

export default function LeoRecapPage() {
  return (
    <div className="space-y-4">
      <div className="recap-print-hide">
        <SectionBanner
          title="Monthly recap"
          subtitle="Leo, month by month"
          index={1}
        />
      </div>
      <RecapBook />
    </div>
  );
}
