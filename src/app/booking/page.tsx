import type { Metadata } from 'next';
import { BookingWizard } from '@/components/booking';
import { BUSINESS_INFO } from '@/content/business';
import { SERVICE_BOUNDARIES, WOMEN_ONLY_STATEMENT } from '@/content/boundaries';

export const metadata: Metadata = {
  title: `Book Online | ${BUSINESS_INFO.name}`,
  description: `Book your mobile hairdressing appointment or companionship service in ${BUSINESS_INFO.serviceArea.region}. Quick online booking in under 30 seconds.`,
  keywords: [
    'book mobile hairdresser',
    'book appointment',
    'mobile hair booking',
    'Sutton hairdresser booking',
    'Surrey mobile salon',
  ],
  openGraph: {
    title: `Book Online | ${BUSINESS_INFO.name}`,
    description: `Book your mobile hairdressing appointment or companionship service. Quick and easy online booking.`,
    type: 'website',
  },
};

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-cream/30">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-rose-50 to-sage-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-playfair text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
              Book Your Appointment
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {WOMEN_ONLY_STATEMENT.short} • Professional mobile services in the
              comfort of your home
            </p>
            <p className="mt-2 text-sm text-sage-600">
              🕐 Book in under 30 seconds
            </p>
          </div>
        </div>
      </section>

      {/* Booking wizard */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <BookingWizard />
          </div>
        </div>
      </section>

      {/* Service boundaries reminder */}
      <section className="border-t border-sage-100 bg-sage-50/50 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
              Service Guidelines
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {SERVICE_BOUNDARIES.included.companionship.description}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SERVICE_BOUNDARIES.excluded.slice(0, 4).map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs text-muted-foreground shadow-sm"
                >
                  ✕ {category.category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact support */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <h3 className="font-semibold text-foreground">Need Help Booking?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Prefer to book by phone or have questions? I'm happy to help!
            </p>
            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
              <a
                href={`tel:${BUSINESS_INFO.contact.phone}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <span>📞</span>
                <span className="font-medium">{BUSINESS_INFO.contact.phone}</span>
              </a>
              <span className="hidden text-muted-foreground sm:inline">|</span>
              <a
                href={`mailto:${BUSINESS_INFO.contact.email}?subject=Booking Enquiry`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <span>✉️</span>
                <span className="font-medium">{BUSINESS_INFO.contact.email}</span>
              </a>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Available {BUSINESS_INFO.hours.weekdays.open} -{' '}
              {BUSINESS_INFO.hours.weekdays.close} Mon-Fri
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
