import { SectionBanner } from '@/components/leo';
import { RoutineBuilder } from '@/components/leo/routine/routine-builder';

export default function LeoRoutinePage() {
  return (
    <div className="space-y-4">
      <SectionBanner
        title="Routine"
        subtitle="Leo's rhythm, cues & what works"
        index={2}
      />
      <RoutineBuilder />
    </div>
  );
}
