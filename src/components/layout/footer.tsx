import Link from 'next/link';
import { Scissors, Phone, Mail, MapPin, Shield, Heart } from 'lucide-react';
import { BUSINESS_INFO, formatBusinessHours } from '@/content/business';
import { WOMEN_ONLY_STATEMENT } from '@/content/boundaries';
import type { Route } from 'next';

const footerLinks = {
  services: [
    { href: '/services#hairdressing' as Route, label: 'Mobile Hairdressing' },
    { href: '/services#companion' as Route, label: 'Companion Visits' },
    { href: '/services#errands' as Route, label: 'Errands & Assistance' },
    { href: '/services#packages' as Route, label: 'Packages' },
  ],
  company: [
    { href: '/about' as Route, label: 'About Christina' },
    { href: '/reviews' as Route, label: 'Reviews' },
    { href: '/safety' as Route, label: 'Safety & Boundaries' },
    { href: '/contact' as Route, label: 'Contact' },
  ],
  policies: [
    { href: '/terms' as Route, label: 'Terms of Service' },
    { href: '/privacy' as Route, label: 'Privacy Policy' },
    { href: '/cancellation' as Route, label: 'Cancellation Policy' },
  ],
};

export function Footer() {
  const hours = formatBusinessHours();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      {/* Main Footer */}
      <div className="container-custom py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Scissors className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display text-xl font-bold text-foreground">
                  Christina&apos;s
                </span>
                <span className="block text-xs text-muted-foreground">
                  Care Services
                </span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {WOMEN_ONLY_STATEMENT.medium}
            </p>

            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800">
                <Shield className="h-3.5 w-3.5" />
                DBS Checked
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-800">
                <Shield className="h-3.5 w-3.5" />
                Fully Insured
              </div>
              <div className="flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-800">
                <Heart className="h-3.5 w-3.5" />
                Women Only
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground">Services</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 font-semibold text-foreground">Policies</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.policies.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground">Contact</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href={`tel:${BUSINESS_INFO.contact.phone.replace(/\s/g, '')}`}
                  className="flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  {BUSINESS_INFO.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS_INFO.contact.email}`}
                  className="flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  {BUSINESS_INFO.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Serving {BUSINESS_INFO.baseTown} & surrounding areas
                  <br />
                  Within 10 miles
                </span>
              </li>
            </ul>

            {/* Hours Summary */}
            <h4 className="mt-6 text-sm font-medium text-foreground">Hours</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Mon-Fri: {hours[0].hours}
              <br />
              Sat: {hours[5].hours}
              <br />
              Sun: {hours[6].hours}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-muted/50">
        <div className="container-custom flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} {BUSINESS_INFO.name}. All rights reserved.
          </p>
          <p className="text-center text-xs text-muted-foreground">
            A women-only service in {BUSINESS_INFO.baseTown}, {BUSINESS_INFO.county}
          </p>
        </div>
      </div>
    </footer>
  );
}
