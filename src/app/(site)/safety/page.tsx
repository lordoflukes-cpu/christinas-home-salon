import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BUSINESS_INFO } from '@/content/business';
import { SERVICE_BOUNDARIES, WOMEN_ONLY_STATEMENT } from '@/content/boundaries';

export const metadata: Metadata = {
  title: `Service Boundaries & Safety | ${BUSINESS_INFO.name}`,
  description: `Clear information about what's included in ${BUSINESS_INFO.name} services. Companionship boundaries, safety practices, and women-only policy explained.`,
  keywords: [
    'mobile hairdresser boundaries',
    'companionship service limits',
    'women only service',
    'safe mobile services',
    'service guidelines',
  ],
  openGraph: {
    title: `Service Boundaries & Safety | ${BUSINESS_INFO.name}`,
    description: `Clear information about what's included in my services and what isn't.`,
    type: 'website',
  },
};

const safetyPractices = [
  {
    icon: '🔒',
    title: 'DBS Checked',
    description:
      'I hold an enhanced DBS certificate through the Update Service, which can be verified at any time.',
  },
  {
    icon: '📋',
    title: 'Fully Insured',
    description:
      'Professional liability insurance and public liability coverage for complete peace of mind.',
  },
  {
    icon: '🆔',
    title: 'ID on Request',
    description:
      'Happy to show my ID and professional credentials when I arrive at your home.',
  },
  {
    icon: '👤',
    title: 'Solo Practitioner',
    description:
      "I work alone and don't send substitutes or assistants. You'll always know who's coming.",
  },
  {
    icon: '📱',
    title: 'Contact Available',
    description:
      'Reach me directly by phone, text, or email before, during, or after appointments.',
  },
  {
    icon: '🚨',
    title: 'Emergency Aware',
    description:
      'First Aid certified and know how to respond appropriately in emergency situations.',
  },
];

const boundaryCategories = [
  {
    title: 'Hairdressing Services',
    description: 'Professional NVQ Level 2 qualified hairdressing for women of all ages.',
    included: [
      'Cut, colour, blow-dry, styling',
      'Root touch-ups and full colour',
      'Highlights (partial and full head)',
      'Deep conditioning treatments',
      'Hair care advice and education',
    ],
    notIncluded: [
      'Perms',
      "Men's haircuts",
      'Formal event/bridal styling',
      'Hair extensions',
    ],
  },
  {
    title: 'Companionship',
    description: SERVICE_BOUNDARIES.included.companionship.description,
    included: SERVICE_BOUNDARIES.included.companionship.items.slice(0, 6),
    notIncluded: SERVICE_BOUNDARIES.excluded.slice(0, 3).flatMap(cat => cat.items.slice(0, 2)),
  },
  {
    title: 'Errands & Shopping',
    description: SERVICE_BOUNDARIES.included.errands.description,
    included: SERVICE_BOUNDARIES.included.errands.items.slice(0, 6),
    notIncluded: [
      'Heavy lifting or furniture moving',
      'House cleaning or tidying',
      'Pet care or dog walking',
      'Childcare or school runs',
      'Driving clients in my vehicle',
    ],
  },
];

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-cream/30">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-rose-50 to-sage-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Transparency & Trust
            </Badge>
            <h1 className="font-playfair text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
              Service Boundaries & Safety
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Clear information about what I do, what I don't do, and how I keep
              you safe
            </p>
          </div>
        </div>
      </section>

      {/* Women-only section */}
      <section className="border-b border-sage-100 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-white">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left">
                  <div className="mb-4 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 md:mb-0 md:mr-6">
                    <span className="text-3xl">💜</span>
                  </div>
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-primary">
                      {WOMEN_ONLY_STATEMENT.short}
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                      {WOMEN_ONLY_STATEMENT.full}
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {WOMEN_ONLY_STATEMENT.medium}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Safety practices */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="font-playfair text-2xl font-bold text-primary md:text-3xl">
                Your Safety Is My Priority
              </h2>
              <p className="mt-2 text-muted-foreground">
                Professional standards and practices you can trust
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {safetyPractices.map((practice, index) => (
                <Card key={index} className="border-sage-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{practice.icon}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {practice.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {practice.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service boundaries detail */}
      <section className="bg-cream/50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="font-playfair text-2xl font-bold text-primary md:text-3xl">
                Service Boundaries Explained
              </h2>
              <p className="mt-2 text-muted-foreground">
                What's included in each service category
              </p>
            </div>
            <div className="mt-10 space-y-8">
              {boundaryCategories.map((category, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-sage-50">
                    <CardTitle className="text-xl text-primary">
                      {category.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 font-medium text-sage-700">
                          <span className="text-green-500">✓</span> What's Included
                        </h4>
                        <ul className="space-y-2">
                          {category.included.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="mt-0.5 text-green-500">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 font-medium text-rose-700">
                          <span className="text-rose-500">✕</span> Not Included
                        </h4>
                        <ul className="space-y-2">
                          {category.notIncluded.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="mt-0.5 text-rose-500">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick reference */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Card className="border-sage-200">
              <CardHeader>
                <CardTitle className="text-center text-xl">
                  Quick Reference: What I Don't Do
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {SERVICE_BOUNDARIES.excluded.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-700"
                    >
                      <span className="text-rose-500">✕</span>
                      {category.category}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  These boundaries help me provide the best possible service within my
                  expertise and ensure everyone's safety.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Questions CTA */}
      <section className="bg-gradient-to-r from-primary to-rose-600 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-playfair text-2xl font-bold md:text-3xl">
              Have Questions?
            </h2>
            <p className="mt-3 text-rose-100">
              Not sure if something is included? Please don't hesitate to ask – I'm
              happy to clarify anything before you book.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-rose-50"
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/booking">Book Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
