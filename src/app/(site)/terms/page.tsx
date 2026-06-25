import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/content/business';

export const metadata: Metadata = {
  title: `Terms & Conditions | ${BUSINESS_INFO.name}`,
  description: `Terms and conditions for ${BUSINESS_INFO.name} mobile hairdressing and companionship services.`,
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-playfair text-3xl font-bold text-primary md:text-4xl">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-sage mt-8 max-w-none">
            <h2>1. Introduction</h2>
            <p>
              These terms and conditions govern your use of {BUSINESS_INFO.name}'s mobile
              hairdressing and companionship services ("Services"). By booking an appointment
              or using our Services, you agree to these terms.
            </p>

            <h2>2. Service Description</h2>
            <p>
              {BUSINESS_INFO.name} provides mobile hairdressing services and non-medical
              companionship/errand services exclusively to women in the{' '}
              {BUSINESS_INFO.serviceArea.region} area.
            </p>
            <p>
              Our companionship services are social in nature and do not include personal
              care, medical assistance, cleaning, childcare, or any overnight services.
              For full details of service boundaries, please see our{' '}
              <Link href="/safety" className="text-primary hover:underline">
                Service Boundaries
              </Link>{' '}
              page.
            </p>

            <h2>3. Booking & Appointments</h2>
            <h3>3.1 Making a Booking</h3>
            <p>
              Bookings can be made through our website, by phone, or by email. All bookings
              are subject to availability and confirmation.
            </p>

            <h3>3.2 Appointment Times</h3>
            <p>
              I will make every effort to arrive at the scheduled time. If I am running
              late (more than 15 minutes), I will contact you to inform you. Please ensure
              you are available at the agreed time.
            </p>

            <h3>3.3 Access Requirements</h3>
            <p>
              You must provide safe access to your home and a suitable space for the
              service to be carried out. For hairdressing services, this should include
              access to running water and a chair in a well-lit area.
            </p>

            <h2>4. Cancellation Policy</h2>
            <p>
              Please refer to our{' '}
              <Link href="/cancellation" className="text-primary hover:underline">
                Cancellation Policy
              </Link>{' '}
              for full details on cancellations and rescheduling.
            </p>
            <ul>
              <li>More than 48 hours notice: Full refund or reschedule</li>
              <li>24-48 hours notice: 50% fee may apply</li>
              <li>Less than 24 hours or no-show: Full fee may be charged</li>
            </ul>

            <h2>5. Pricing & Payment</h2>
            <h3>5.1 Prices</h3>
            <p>
              All prices are displayed on our website and are inclusive of VAT where
              applicable. Travel fees may apply based on your location.
            </p>

            <h3>5.2 Payment</h3>
            <p>
              Payment is due at the end of each appointment unless otherwise agreed.
              I accept cash, bank transfer, and card payments.
            </p>

            <h3>5.3 Price Changes</h3>
            <p>
              Prices may change from time to time. You will be informed of any price
              changes before booking.
            </p>

            <h2>6. Allergies & Sensitivities</h2>
            <p>
              Please inform me of any allergies, skin sensitivities, or medical conditions
              that may affect the service before your appointment. I use professional
              products but cannot guarantee reactions will not occur.
            </p>

            <h2>7. Liability</h2>
            <h3>7.1 Insurance</h3>
            <p>
              I hold public liability insurance and professional indemnity insurance for
              all services provided.
            </p>

            <h3>7.2 Limitations</h3>
            <p>
              While I take every care to provide excellent service, I cannot be held
              liable for:
            </p>
            <ul>
              <li>
                Allergic reactions to products where you have not informed me of
                sensitivities
              </li>
              <li>Results that differ from expectations due to hair condition</li>
              <li>Damage to property caused by your negligence</li>
              <li>Any pre-existing conditions or damage to hair</li>
            </ul>

            <h2>8. Complaints</h2>
            <p>
              If you are not satisfied with any service, please contact me within 7 days
              of your appointment. I will do my best to resolve any issues fairly.
            </p>

            <h2>9. Privacy</h2>
            <p>
              Your personal information is handled in accordance with our{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              I reserve the right to update these terms at any time. Continued use of
              Services after changes constitutes acceptance of the new terms.
            </p>

            <h2>11. Contact</h2>
            <p>
              If you have any questions about these terms, please contact me:
            </p>
            <ul>
              <li>Email: {BUSINESS_INFO.contact.email}</li>
              <li>Phone: {BUSINESS_INFO.contact.phone}</li>
            </ul>
          </div>

          <div className="mt-10 border-t border-sage-100 pt-6">
            <Link
              href="/"
              className="text-sm text-primary hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
