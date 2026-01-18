import { Metadata } from 'next';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServicesContent, PackagesSection } from '@/components/services';
import { BUSINESS_INFO } from '@/content/business';
import { WOMEN_ONLY_STATEMENT } from '@/content/boundaries';

export const metadata: Metadata = {
  title: 'Services & Pricing',
  description: `Mobile hairdressing, companion visits, and errand services for women in ${BUSINESS_INFO.baseTown}. View all services, pricing, and packages. Book online today.`,
  openGraph: {
    title: `Services & Pricing | ${BUSINESS_INFO.name}`,
    description: `Mobile hairdressing, companion visits, and errand services for women in ${BUSINESS_INFO.baseTown}. View all services, pricing, and packages.`,
  },
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cream-50 to-background py-12 md:py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 gap-1.5">
              <Heart className="h-3.5 w-3.5 text-primary" />
              Women Only
            </Badge>
            <h1 className="heading-1">Services & Pricing</h1>
            <p className="body-large mt-4 text-balance">
              {WOMEN_ONLY_STATEMENT.medium} Browse my services below and book your
              home visit online.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/booking">
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#packages">View Packages</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="border-b bg-muted/30 py-4">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Jump to:</span>
            <Link
              href="#hairdressing"
              className="rounded-full bg-background px-4 py-1.5 font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Hairdressing
            </Link>
            <Link
              href="#companion"
              className="rounded-full bg-background px-4 py-1.5 font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Companion Visits
            </Link>
            <Link
              href="#errands"
              className="rounded-full bg-background px-4 py-1.5 font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Errands
            </Link>
            <Link
              href="#packages"
              className="rounded-full bg-background px-4 py-1.5 font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <ServicesContent />

      {/* Packages */}
      <PackagesSection />

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-primary-foreground">
              Ready to Book?
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Choose your service and book your home visit in less than 30 seconds.
              I&apos;ll confirm your appointment within 24 hours.
            </p>
            <Button
              asChild
              size="xl"
              className="mt-6 bg-white text-primary hover:bg-white/90"
            >
              <Link href="/booking">
                Book Your Visit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
