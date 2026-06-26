import { SectionBanner } from '@/components/leo';
import { SecondBrain } from '@/components/leo/ai/second-brain';

export default function LeoBrainPage() {
  return (
    <div className="space-y-4">
      <SectionBanner
        title="Second Brain"
        subtitle="What Leo remembers"
        index={2}
      />
      <SecondBrain />
    </div>
  );
}
