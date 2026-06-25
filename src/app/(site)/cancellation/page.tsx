import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { BUSINESS_INFO } from '@/content/business';

export const metadata: Metadata = {
  title: `Cancellation Policy | ${BUSINESS_INFO.name}`,
  description: `Cancellation and rescheduling policy for ${BUSINESS_INFO.name} mobile hairdressing and companionship services in ${BUSINESS_INFO.baseTown}.`,
};

const policyItems = [
  {
    timeframe: 'More than 24 hours',
    description: 'Free cancellation or reschedule',
    fee: 'No fee',
    color: 'bg-green-50 border-green-200 text-green-700',
    icon: '✓',
  },
  {
    timeframe: 'Less than 24 hours',
    description: 'Late cancellation fee applies',
    fee: '50% of service cost',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    icon: '⚠',
  },
  {
    timeframe: 'No-show / No contact',
    description: 'Missed appointment without notice',
    fee: '100% of service cost',
    color: 'bg-rose-50 border-rose-200 text-rose-700',
    icon: '✕',
  },
];

export default function CancellationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-cream/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-playfair text-3xl font-bold text-primary md:text-4xl">
            Cancellation Policy
          </h1>
          <p className="mt-2 text-muted-foreground">
            I understand that plans can change – here's how cancellations work
          </p>

          {/* Key point */}
          <div className="mt-6 rounded-lg bg-rose-50 border border-rose-200 p-4">
            <p className="text-rose-800 font-medium text-center">
              📅 Please provide at least <strong>24 hours' notice</strong> to cancel or reschedule
            </p>
          </div>

          {/* Visual summary */}
          <div className="mt-8 space-y-4">
            {policyItems.map((item, index) => (
              <Card key={index} className={`border ${item.color}`}>
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.timeframe}</h3>
                    <p className="text-sm opacity-80">{item.description}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-medium">
                    {item.fee}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="prose prose-sage mt-10 max-w-none">
            <h2>Full Policy Details</h2>

            <h3>Why I Have a Cancellation Policy</h3>
            <p>
              As a mobile service provider, I travel to your home at an agreed time and reserve 
              that time slot exclusively for you. When an appointment is cancelled at short notice, 
              I lose the opportunity to help another client – and that time cannot be recovered. 
              This policy is fair to all my clients and helps me run a sustainable business.
            </p>

            <h3>The 24-Hour Rule</h3>
            <p>
              <strong>24 hours' notice is required to cancel or reschedule any appointment.</strong>
            </p>
            <ul>
              <li>
                <strong>More than 24 hours' notice:</strong> No fee. Happy to reschedule.
              </li>
              <li>
                <strong>Less than 24 hours' notice:</strong> 50% of the service cost is charged.
              </li>
              <li>
                <strong>No-show (no contact):</strong> 100% of the service cost is charged.
              </li>
            </ul>

            <h3>How to Cancel or Reschedule</h3>
            <p>Please contact me as soon as possible if you need to cancel or reschedule:</p>
            <ul>
              <li>
                <strong>Phone:</strong> {BUSINESS_INFO.contact.phone}
              </li>
              <li>
                <strong>Email:</strong> {BUSINESS_INFO.contact.email}
              </li>
              <li>
                <strong>WhatsApp:</strong> {BUSINESS_INFO.contact.whatsapp || BUSINESS_INFO.contact.phone}
              </li>
            </ul>
            <p>
              The time of your message (sent, not read) determines which cancellation tier applies.
              Voicemail and text messages count, so please leave one if I don't answer.
            </p>

            <h3>Exceptions (At My Discretion)</h3>
            <p>
              I understand that genuine emergencies happen. The following circumstances
              may be exempt from cancellation fees:
            </p>
            <ul>
              <li>Sudden illness or medical emergency (you or immediate family)</li>
              <li>Bereavement</li>
              <li>Extreme weather conditions making travel unsafe</li>
              <li>Unexpected hospitalisation</li>
            </ul>
            <p>
              In these cases, please let me know as soon as you're able. Exceptions are 
              granted at my discretion and are not automatic.
            </p>

            <h3>No-Shows</h3>
            <p>
              If I arrive at your home and you are not available or do not respond, this
              is a no-show and <strong>100% of the service fee will be charged</strong>.
            </p>
            <p>
              I will wait up to 15 minutes and attempt to contact you by phone and 
              knocking before leaving. If there's been a genuine miscommunication about 
              the date or time, please contact me immediately to discuss.
            </p>

            <h3>If I Need to Cancel</h3>
            <p>
              In the rare event that I need to cancel your appointment (due to illness, 
              family emergency, or unforeseen circumstances), I will:
            </p>
            <ul>
              <li>Contact you as soon as possible</li>
              <li>Offer you priority rebooking for the next available slot</li>
              <li>Never charge you any fee</li>
            </ul>

            <h3>Deposits for New Clients & Colour Services</h3>
            <p>
              To secure your booking, I may request a deposit for:
            </p>
            <ul>
              <li>First appointments with new clients</li>
              <li>Colour services (where products must be purchased in advance)</li>
              <li>Longer services or packages</li>
            </ul>
            <p>Deposits are:</p>
            <ul>
              <li>
                <strong>Fully refundable:</strong> If cancelled more than 24 hours in advance
              </li>
              <li>
                <strong>Non-refundable:</strong> For late cancellations or no-shows
              </li>
              <li>
                <strong>Transferable:</strong> To a rescheduled appointment (if rescheduled 
                more than 24 hours before the original time)
              </li>
            </ul>

            <h3>Running Late?</h3>
            <p>
              If you're running late, please let me know. I will do my best to accommodate, 
              but if the delay significantly impacts the appointment time I have available, 
              we may need to adjust the service or reschedule.
            </p>
            <p>
              If you are more than 30 minutes late without contact, the appointment may 
              be treated as a no-show.
            </p>

            <h2>Payment of Cancellation Fees</h2>
            <p>
              Cancellation fees can be paid by bank transfer. I will send you an invoice 
              with payment details. Fees are payable within 7 days.
            </p>
            <p>
              Please note: Repeated late cancellations may result in deposits being required 
              for all future bookings.
            </p>

            <h2>Questions?</h2>
            <p>
              If you have any questions about this policy or your specific situation,
              please don't hesitate to{' '}
              <Link href="/contact" className="text-primary hover:underline">
                get in touch
              </Link>
              . I'm always happy to discuss and find a fair solution where possible.
            </p>
          </div>

          <div className="mt-10 border-t border-sage-100 pt-6">
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
