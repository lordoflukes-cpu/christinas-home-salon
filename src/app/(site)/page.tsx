import { Metadata } from 'next';
import {
  HeroSection,
  HowItWorks,
  ServicesPreview,
  TrustSection,
  TestimonialsSection,
  FAQSection,
  ServiceAreaChecker,
  CTASection,
} from '@/components/home';
import { BUSINESS_INFO } from '@/content/business';

export const metadata: Metadata = {
  title: `${BUSINESS_INFO.name} | Mobile Hairdressing & Companionship for Women`,
  description: `Women-only mobile hairdressing, companionship visits, and errand services in ${BUSINESS_INFO.baseTown} and surrounding areas. DBS checked, fully insured. Book your home visit today.`,
  openGraph: {
    title: `${BUSINESS_INFO.name} | Mobile Hairdressing & Companionship for Women`,
    description: `Women-only mobile hairdressing, companionship visits, and errand services in ${BUSINESS_INFO.baseTown}. DBS checked, fully insured.`,
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <ServicesPreview />
      <TrustSection />
      <ServiceAreaChecker />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
