import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/content/business';

export const metadata: Metadata = {
  title: `Privacy Policy | ${BUSINESS_INFO.name}`,
  description: `Privacy policy for ${BUSINESS_INFO.name}. How we collect, use, and protect your personal information.`,
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-playfair text-3xl font-bold text-primary md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-sage mt-8 max-w-none">
            <h2>1. Introduction</h2>
            <p>
              {BUSINESS_INFO.name} ("I", "me", "my") is committed to protecting your
              privacy. This policy explains how I collect, use, and safeguard your
              personal information when you use my website and services.
            </p>

            <h2>2. Information I Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <p>When you book an appointment or contact me, I may collect:</p>
            <ul>
              <li>Name and contact details (email, phone number)</li>
              <li>Address (for home visits)</li>
              <li>Service preferences and appointment history</li>
              <li>Any health information you choose to share (allergies, conditions)</li>
              <li>Payment information (processed securely)</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <p>When you visit my website, I may automatically collect:</p>
            <ul>
              <li>Device and browser information</li>
              <li>IP address and approximate location</li>
              <li>Pages visited and time spent on site</li>
              <li>Referring website</li>
            </ul>

            <h2>3. How I Use Your Information</h2>
            <p>I use your personal information to:</p>
            <ul>
              <li>Provide and improve my services</li>
              <li>Communicate about appointments and bookings</li>
              <li>Send reminders and follow-up messages</li>
              <li>Process payments</li>
              <li>Respond to enquiries</li>
              <li>Comply with legal obligations</li>
              <li>With your consent, send occasional updates or offers</li>
            </ul>

            <h2>4. Legal Basis for Processing</h2>
            <p>I process your data based on:</p>
            <ul>
              <li>
                <strong>Contract:</strong> To provide the services you've booked
              </li>
              <li>
                <strong>Legitimate interests:</strong> To run my business effectively
              </li>
              <li>
                <strong>Consent:</strong> For marketing communications (you can opt out
                anytime)
              </li>
              <li>
                <strong>Legal obligation:</strong> For tax and business records
              </li>
            </ul>

            <h2>5. Sharing Your Information</h2>
            <p>
              I do not sell your personal information. I may share your data only with:
            </p>
            <ul>
              <li>Payment processors (to handle transactions securely)</li>
              <li>Email service providers (to send appointment confirmations)</li>
              <li>Legal authorities (if required by law)</li>
            </ul>

            <h2>6. Data Security</h2>
            <p>I take reasonable precautions to protect your information, including:</p>
            <ul>
              <li>Secure storage of digital records</li>
              <li>Encrypted website connections (HTTPS)</li>
              <li>Regular review of security practices</li>
              <li>Limited access to personal information</li>
            </ul>

            <h2>7. Data Retention</h2>
            <p>I keep your information for:</p>
            <ul>
              <li>
                <strong>Active clients:</strong> As long as you use my services, plus 2
                years
              </li>
              <li>
                <strong>Financial records:</strong> 7 years (legal requirement)
              </li>
              <li>
                <strong>Marketing contacts:</strong> Until you unsubscribe
              </li>
            </ul>

            <h2>8. Your Rights</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Correction:</strong> Ask me to correct inaccurate information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your data (where applicable)
              </li>
              <li>
                <strong>Objection:</strong> Object to certain processing
              </li>
              <li>
                <strong>Portability:</strong> Receive your data in a portable format
              </li>
              <li>
                <strong>Withdraw consent:</strong> Where processing is based on consent
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact me using the details below.
            </p>

            <h2>9. Cookies</h2>
            <p>My website uses cookies to:</p>
            <ul>
              <li>Remember your preferences</li>
              <li>Understand how you use the site</li>
              <li>Improve site functionality</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling cookies may
              affect site functionality.
            </p>

            <h2>10. Third-Party Links</h2>
            <p>
              My website may link to external sites. I am not responsible for the privacy
              practices of other websites.
            </p>

            <h2>11. Children's Privacy</h2>
            <p>
              My services are for adults only. I do not knowingly collect information from
              children under 18.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              I may update this policy from time to time. Significant changes will be
              communicated on this page.
            </p>

            <h2>13. Contact & Complaints</h2>
            <p>For privacy-related questions or to exercise your rights, contact me:</p>
            <ul>
              <li>Email: {BUSINESS_INFO.contact.email}</li>
              <li>Phone: {BUSINESS_INFO.contact.phone}</li>
            </ul>
            <p>
              If you're not satisfied with my response, you can complain to the Information
              Commissioner's Office (ICO):{' '}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
              >
                ico.org.uk
              </a>
            </p>
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
