# Christina's Home Salon

A modern, production-ready website for a women-only mobile hairdressing and companionship services business. Built with Next.js 14+, TypeScript, Tailwind CSS, and shadcn/ui.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38bdf8)

## ✨ Features

- **🎨 Beautiful, Mobile-First Design** - Stunning visual design optimized for all devices
- **⚡ Fast Booking Flow** - Complete booking in under 30 seconds with multi-step wizard
- **🔒 Women-Only Messaging** - Clear positioning and trust signals throughout
- **📍 Service Area Checker** - Real-time postcode validation with travel fee calculation
- **📱 Responsive** - Perfect experience on mobile, tablet, and desktop
- **♿ Accessible** - WCAG-compliant with proper ARIA labels and keyboard navigation
- **🔍 SEO Optimized** - JSON-LD schema, meta tags, and semantic HTML
- **🎭 Smooth Animations** - Framer Motion powered micro-interactions
- **✅ Form Validation** - React Hook Form + Zod for robust validation
- **💾 State Persistence** - Zustand with session storage for booking progress

## 🛠️ Tech Stack

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Testing:** [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with fonts & SEO
│   ├── page.tsx           # Homepage
│   ├── booking/           # Booking wizard
│   ├── services/          # Services listing
│   ├── about/             # About Christina
│   ├── reviews/           # Client testimonials
│   ├── contact/           # Contact form & info
│   ├── safety/            # Service boundaries
│   └── (policies)/        # Terms, Privacy, Cancellation
│
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Footer
│   ├── home/              # Homepage sections
│   ├── booking/           # Booking wizard steps
│   ├── services/          # Services page components
│   ├── reviews/           # Reviews components
│   └── contact/           # Contact form
│
├── content/               # Typed content data
│   ├── services.ts        # Service categories & options
│   ├── packages.ts        # Service packages
│   ├── faqs.ts           # FAQs by category
│   ├── reviews.ts        # Client reviews
│   ├── business.ts       # Business info
│   └── boundaries.ts     # Service boundaries
│
├── lib/
│   ├── pricing/          # Price calculator
│   ├── schema/           # Zod validation schemas
│   ├── store/            # Zustand stores
│   ├── seo/              # JSON-LD schemas
│   └── utils.ts          # Utility functions
│
└── styles/
    └── globals.css       # Global styles & Tailwind

tests/
├── unit/                 # Vitest unit tests
├── e2e/                  # Playwright E2E tests
└── setup.ts             # Test setup
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/christinas-care-services.git
   cd christinas-care-services
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Site URL (for SEO and metadata)
NEXT_PUBLIC_SITE_URL=https://christinas-hair-and-care.co.uk

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Form submission service
FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxx
```

## 📝 Configuration

### Customizing Business Info

Edit `src/content/business.ts` to update:
- Business name and owner
- Contact details (phone, email)
- Service area and postcodes
- Opening hours
- Trust signals

### Customizing Services & Pricing

Edit `src/content/services.ts` and `src/content/packages.ts`:
- Service categories and options
- Pricing for each service
- Duration estimates
- Package bundles

### Customizing Service Area

Edit `src/lib/pricing/config.ts`:
- `POSTCODE_DISTANCES` - Map postcodes to distance tiers
- `PRICING_CONFIG.travelFees` - Set travel fees per tier

### Customizing Colors & Theme

Edit `tailwind.config.ts`:
- Brand colors (rose, sage, cream)
- Typography settings
- Custom animations

## 🧪 Testing

### Unit Tests (Vitest)
```bash
# Run unit tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
# Install browsers (first time)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Deployment

The app is ready for deployment on:
- **Vercel** (recommended) - Zero config deployment
- **Netlify** - With Next.js adapter
- **AWS Amplify** - With Next.js support
- **Self-hosted** - Node.js server

## 📄 Pages Overview

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Hero, services preview, trust signals, FAQs, CTA |
| Services | `/services` | Full service listing with pricing |
| Booking | `/booking` | 5-step booking wizard |
| About | `/about` | Christina's story, qualifications, values |
| Reviews | `/reviews` | Client testimonials with filtering |
| Contact | `/contact` | Contact form and business info |
| Safety | `/safety` | Service boundaries explained |
| Terms | `/terms` | Terms and conditions |
| Privacy | `/privacy` | Privacy policy |
| Cancellation | `/cancellation` | Cancellation policy |

## 🔧 Key Features Deep Dive

### Booking Wizard

The 5-step booking flow:
1. **Service Type** - Choose hairdressing, companionship, errands, or packages
2. **Options** - Select specific service or package
3. **Location** - Postcode check + address entry
4. **Date & Time** - Calendar selection with availability
5. **Details** - Client info + consent checkboxes

### Service Area Checker

- Real-time postcode validation
- Automatic travel fee calculation
- Clear messaging for out-of-area postcodes
- Integration-ready for geocoding APIs

### Content Management

All content is centralized in `src/content/`:
- Typed TypeScript exports
- Easy to update without touching components
- Consistent across the site

## 🎯 Service Boundaries

Clear messaging throughout about what's included and excluded:

**Included:**
- Professional hairdressing services
- Companionship visits and conversation
- Errands and shopping assistance
- Accompanied outings

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# ============================================
# EMAIL CONFIGURATION (Required for production)
# ============================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@christinashomesalon.co.uk
EMAIL_TO=hello@christinashomesalon.co.uk
CUSTOMER_EMAIL_ENABLED=true

# ============================================
# SITE CONFIGURATION
# ============================================
NEXT_PUBLIC_SITE_URL=https://christinashomesalon.co.uk
```

### Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (christinashomesalon.co.uk)
3. Add DNS records in Vercel:
   - DKIM, SPF, MX, DMARC records from Resend
4. Generate API key and add to `RESEND_API_KEY`

### Email Provider Fallback

If `RESEND_API_KEY` is not set, the system falls back to `ConsoleProvider` which logs emails to the console (useful for development).

### Email Notifications

- **Business notifications**: Sent to `EMAIL_TO` for all bookings and enquiries
- **Customer confirmations**: Sent to client email if `CUSTOMER_EMAIL_ENABLED=true`
- **From address**: Uses `EMAIL_FROM` for all outgoing emails

## 🎯 Phase 2/3 Launch Hardening Features

The site is production-ready with the following hardening features:

### ✅ Real Booking & Enquiry Submission

- **Booking API** (`/api/booking`): Full booking processing with email notifications
- **Enquiry API** (`/api/enquiry`): Out-of-area and general enquiry handling
- **Email notifications**: Business + customer emails via Resend
- **Booking references**: Format `CHS-YYYYMMDD-XXXX`
- **Enquiry references**: Format `ENQ-YYYYMMDD-XXXX`

### 🛡️ Anti-Spam Protection

- **Honeypot field**: `website` field must be empty
- **Rate limiting**: In-memory rate limiter (3 bookings/min, 2 enquiries/min per IP)
- **Server-side pricing**: Never trust client-submitted prices
- **Validation**: Zod schema validation on all inputs

### 📍 Service Area Enforcement

- **Travel tiers**: 
  - 0-6 miles: FREE (Sutton, Cheam, Belmont, Carshalton)
  - 6-10 miles: £5 (Morden, Kingston, New Malden)
  - 10-15 miles: £12 (Wimbledon, Croydon centre)
  - 15+ miles: Enquiry only (special arrangement)
- **Postcode validation**: Real-time postcode district lookup
- **Distance calculation**: ~80 postcodes mapped to approximate distances

### 💰 Deposit Logic

- **Policy**: £20 fixed deposit for new clients OR colour services
- **Server-side calculation**: Deposit amount calculated on backend
- **Configurable**: Edit via `BUSINESS_INFO.depositPolicy` in `src/content/business.ts`

### 📧 Email System Architecture

- **Provider interface**: `EmailProvider` abstraction
- **Resend provider**: Production email sending
- **Console provider**: Development fallback (no API key needed)
- **Email templates**: HTML + plain text for all notifications
- **Template types**: Booking confirmation, business notification, enquiry

### 🗓️ Calendar Integration

- **ICS generation**: RFC 5545 compliant calendar files
- **Client-side download**: Automatic .ics download for bookings
- **Calendar details**: Service, location, time, duration, reminders

### 🔧 Configuration Management

- **Single source of truth**: `src/content/business.ts` for all business config
- **Service area config**: `src/lib/pricing/config.ts` for postcode distances
- **Type-safe**: Full TypeScript types for all config

## 🏗️ Architecture

### Location Service (`src/lib/location/`)

```typescript
import { getTravelTier, isServiceable, getServiceAreaMessage } from '@/lib/location';

// Get travel tier for postcode
const tier = getTravelTier('SM1 1AA');
// Returns: { tierId, label, fee, withinCoreRadius, enquiryOnly, distanceMiles }

// Check if serviceable
const canBook = isServiceable('SW19 1AA');

// Get friendly message
const message = getServiceAreaMessage('KT4 7AA');
```

### Email Service (`src/lib/notify/email/`)

```typescript
import { getEmailProvider } from '@/lib/notify/email';
import { generateBookingConfirmationEmail } from '@/lib/notify/email/templates';

const emailProvider = getEmailProvider(); // Auto-selects Resend or Console

await emailProvider.send({
  from: { email: 'noreply@domain.com', name: 'Business' },
  to: { email: 'customer@example.com', name: 'Customer' },
  subject: 'Booking Confirmed',
  html: '<p>Your booking is confirmed!</p>',
  text: 'Your booking is confirmed!',
});
```

### Calendar Service (`src/lib/calendar/`)

```typescript
import { createBookingICS, downloadICS } from '@/lib/calendar/ics';

const icsContent = createBookingICS({
  bookingReference: 'CHS-20241215-ABCD',
  serviceName: 'Cut & Blow Dry',
  clientName: 'Jane Smith',
  clientEmail: 'jane@example.com',
  date: '2024-12-20',
  time: '14:00',
  duration: 90,
  address: '123 High Street',
  postcode: 'SM1 1AA',
  businessName: "Christina's Home Salon",
  businessEmail: 'hello@christinashomesalon.co.uk',
});

// Download in browser
downloadICS(icsContent, 'booking.ics');
```

## 🎨 Editing Content

### Business Information

Edit `src/content/business.ts`:

```typescript
export const BUSINESS_INFO = {
  name: "Christina's Home Salon",
  tagline: "Women-Only Mobile Hairdressing in Sutton & Surrey",
  
  // Deposit policy
  depositPolicy: {
    enabled: true,
    trigger: 'NEW_CLIENT_OR_COLOUR', // 'ALL' | 'NEW_CLIENT' | 'COLOUR' | 'NEW_CLIENT_OR_COLOUR'
    depositType: 'FIXED', // 'FIXED' | 'PERCENTAGE'
    amount: 20, // £20 or 20%
  },
  
  // Travel tiers
  travelTiers: [
    { id: 'core', label: 'Core Area', minMiles: 0, maxMiles: 6, fee: 0 },
    { id: 'extended', label: 'Extended Area', minMiles: 6, maxMiles: 10, fee: 5 },
    { id: 'distant', label: 'Distant Area', minMiles: 10, maxMiles: 15, fee: 12 },
  ],
  
  // Business rules
  coreRadiusMiles: 6,
  minAppointmentCharge: 30,
  responseHours: 24,
  
  // Contact
  contact: {
    email: 'hello@christinashomesalon.co.uk',
    phone: '07XXX XXXXXX',
    whatsapp: '447XXXXXXXXX',
    instagramHandle: '@christinashomesalon',
    facebookUrl: 'https://facebook.com/christinashomesalon',
  },
};
```

## 🧪 Testing

This project includes comprehensive test coverage using Vitest for unit tests and Playwright for end-to-end tests.

### Running Tests

**Unit Tests (Vitest)**
```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test -- --run

# Run with coverage
npm run test:coverage

# Open Vitest UI
npm run test:ui
```

**E2E Tests (Playwright)**
```bash
# Run E2E tests
npm run test:e2e

# Run with Playwright UI
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm run test:all
```

### Test Coverage

**Unit Tests** (`tests/unit/`):
- ✅ Location service (postcode tiers, travel fees, normalization)
- ✅ Deposit calculation (new client, colour service, minimum charge)
- ✅ Booking reference generation (CHS-YYYYMMDD-XXXX format)
- ✅ ICS calendar file generation (RFC 5545 compliance)
- ✅ API routes (booking & enquiry validation, honeypot, rate limiting)

**E2E Tests** (`tests/e2e/`):
- ✅ Booking flow (postcode check → wizard → confirmation → ICS download)
- ✅ Enquiry flow (out-of-area detection → enquiry form → submission)
- ✅ Anti-spam (honeypot rejection, rate limiting)
- ✅ Sticky mobile CTA (scroll trigger, WhatsApp integration)

### CI/CD

Tests run automatically on push/PR via GitHub Actions:
- Lint & type checking
- Unit tests with coverage
- E2E tests on Chrome & WebKit
- Reports uploaded on failure

### Postcode Distances

Edit `src/lib/pricing/config.ts` to add/modify postcode districts:

```typescript
export const POSTCODE_DISTANCES: Record<string, number> = {
  'SM1': 0,  // Sutton (base)
  'SM2': 2,  // Belmont
  'KT4': 4,  // Worcester Park
  // Add more postcodes...
};
```

**Not Included:**
- Medical or nursing care
- Personal care (washing, dressing)
- Cleaning or housekeeping
- Childcare
- Overnight stays

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Optimized navigation for all screen sizes

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader friendly

## 🔍 SEO Features

- JSON-LD structured data (LocalBusiness, FAQ, Reviews)
- Open Graph meta tags
- Twitter Card support
- Sitemap ready
- Robots.txt configuration
- Semantic HTML

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

---

Built with ❤️ for Christina's Hair & Care Services
