import { Suspense } from 'react';
import { SectionBanner } from '@/components/leo';
import { RoutineHome } from '@/components/leo/routine/routine-home';

export default function LeoRoutinePage() {
  return (
    <div className="space-y-4">
      <SectionBanner
        title="Routine"
        subtitle="Log what works, settle Leo faster"
        index={2}
      />
      <Suspense fallback={null}>
        <RoutineHome />
      </Suspense>
    </div>
  );
}
