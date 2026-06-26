import { SectionBanner } from '@/components/leo';
import { AskLeo } from '@/components/leo/ai/ask-leo';

export default function LeoAskPage() {
  return (
    <div className="space-y-4">
      <SectionBanner
        title="Ask Leo"
        subtitle="Make sense of what you've logged"
        index={2}
      />
      <AskLeo />
    </div>
  );
}
