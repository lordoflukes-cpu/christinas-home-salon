# Configuration Guide

This guide explains how to edit services, pricing, durations, travel tiers, and policies for Christina's Home Salon website.

---

## Quick Reference: Config File Locations

| What to Change | File Location |
|----------------|---------------|
| Service menu & prices | `src/content/services.ts` |
| Travel fees & tiers | `src/lib/pricing/config.ts` |
| Postcode mappings | `src/lib/pricing/config.ts` |
| Business info & hours | `src/content/business.ts` |
| Packages & bundles | `src/content/packages.ts` |
| Boundaries & exclusions | `src/content/boundaries.ts` |
| FAQs | `src/content/faqs.ts` |

---

## 1. Editing Services & Prices

### File: `src/content/services.ts`

Each service category (hairdressing, companionship, errands) has multiple service options:

```typescript
{
  id: 'cut-blow-dry',           // Unique identifier (kebab-case)
  name: 'Cut & Blow-Dry',       // Display name
  description: 'Full description of the service...',
  duration: 60,                 // Duration in minutes
  durationNote: 'plus processing time',  // Optional note
  price: 35,                    // Price in GBP
  priceNote: 'from',           // Optional (e.g., "from", "per hour")
  popular: true,               // Show "Popular" badge
  isAddOn: false,              // True for add-on services
  addOnFor: ['hairdressing'],  // Which categories this add-on applies to
  isTimeBased: false,          // True for hourly services
  hourlyRate: 20,              // For time-based services
  minDurationMinutes: 60,      // Minimum booking length
  incrementMinutes: 30,        // Time increments allowed
}
```

### Adding a New Service

1. Open `src/content/services.ts`
2. Find the appropriate category (`hairdressing`, `companionship`, or `errands`)
3. Add a new object to the `options` array
4. Ensure `id` is unique across ALL services

### Changing Prices

Simply update the `price` field:

```typescript
{
  id: 'cut-blow-dry',
  price: 38,  // Changed from £35 to £38
  ...
}
```

### Changing Durations

Update the `duration` field (in minutes):

```typescript
{
  id: 'full-colour',
  duration: 150,  // Changed from 120 to 150 minutes
  durationNote: 'including processing',
  ...
}
```

---

## 2. Travel Fees & Service Area

### File: `src/lib/pricing/config.ts`

### Travel Tiers

```typescript
travelTiers: [
  { 
    minMiles: 0, 
    maxMiles: 6, 
    fee: 0,     // FREE for core area
    label: 'Core Area (within 6 miles)',
    areas: 'Sutton, Cheam, Belmont, Carshalton, Wallington'
  },
  { 
    minMiles: 6, 
    maxMiles: 10, 
    fee: 5,     // £5 for extended area
    label: 'Extended Area (6-10 miles)',
    areas: 'Morden, New Malden, Kingston'
  },
  { 
    minMiles: 10, 
    maxMiles: 15, 
    fee: 12,    // £12 for distant area
    label: 'Distant Area (10-15 miles)',
    areas: 'Wimbledon, Croydon town centre'
  },
]
```

### To Change Travel Fees

Update the `fee` value in the relevant tier:

```typescript
{ minMiles: 6, maxMiles: 10, fee: 7 }  // Changed from £5 to £7
```

### Postcode Mappings

The `POSTCODE_DISTANCES` object maps postcode prefixes to approximate distances:

```typescript
export const POSTCODE_DISTANCES: Record<string, number> = {
  'SM1': 0,   // Sutton (base) - 0 miles
  'SM2': 2,   // Belmont - 2 miles
  'SW19': 10, // Wimbledon - 10 miles
  // Add new postcodes as needed
};
```

### Adding a New Postcode

1. Find the postcode prefix (e.g., `SW19` from `SW19 1AA`)
2. Estimate the distance from Sutton in miles
3. Add to `POSTCODE_DISTANCES`:

```typescript
'TW10': 12,  // Richmond - 12 miles
```

---

## 3. Pricing Configuration

### File: `src/lib/pricing/config.ts`

### Core Settings

```typescript
export const PRICING_CONFIG: PricingConfig = {
  minimumCharge: 30,              // Minimum booking fee (£30)
  minimumBookingMinutes: 60,      // 1 hour minimum
  minimumBookingMinutesDistant: 90, // 90 min for 10+ miles
  distantThresholdMiles: 10,      // When distant rules apply
  maxServiceRadiusMiles: 15,      // Maximum service distance
  
  // Surcharges
  surcharges: {
    hairLength: {
      enabled: true,
      amount: 10,
      label: 'Long/thick hair surcharge',
      appliesTo: ['colour', 'highlights'],  // Service types
    },
    sameDay: {
      enabled: false,  // Set to true to enable
      amount: 10,
      label: 'Same-day booking fee',
      hoursThreshold: 24,
    },
  },
  
  // Group Bookings
  groupBooking: {
    enabled: true,
    maxAdditionalClients: 3,
    discountPerClient: 5,  // £5 off each additional haircut
    appliesTo: ['hairdressing'],
  },
  
  // Deposit Policy
  deposit: {
    enabled: true,
    amount: 20,
    requiredFor: ['new-client', 'colour'],
  },
};
```

### Changing the Minimum Charge

```typescript
minimumCharge: 35,  // Changed from £30 to £35
```

### Enabling Same-Day Surcharge

```typescript
surcharges: {
  sameDay: {
    enabled: true,   // Enable the surcharge
    amount: 15,      // £15 fee
    hoursThreshold: 24,
  },
}
```

---

## 4. Business Hours & Contact

### File: `src/content/business.ts`

### Business Hours

```typescript
hours: {
  weekdays: { open: '09:00', close: '18:00' },
  saturday: { open: '09:00', close: '16:00' },
  sunday: { status: 'Closed' },
  note: 'Part-time hours – appointments by booking only',
},
```

### Contact Details

```typescript
contact: {
  phone: '07XXX XXXXXX',
  email: 'hello@christinas-home-salon.co.uk',
  whatsapp: '07XXX XXXXXX',
},
```

### Social Media

```typescript
social: {
  facebook: 'https://facebook.com/christinashomesalon',
  instagram: 'https://instagram.com/christinashomesalon',
},
```

---

## 5. Packages

### File: `src/content/packages.ts`

```typescript
{
  id: 'pamper-package',
  name: 'Pamper Package',
  description: 'Cut, blow-dry, and deep conditioning treatment',
  price: 40,                    // Package price
  savings: 5,                   // Amount saved vs individual prices
  duration: 75,                 // Total time in minutes
  includes: [
    'Cut & Blow-Dry',
    'Deep Conditioning Treatment',
  ],
  popular: true,
}
```

---

## 6. Email Configuration (Resend)

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Email Provider (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Email Settings
EMAIL_FROM=bookings@christinas-home-salon.co.uk
EMAIL_TO=christina@christinas-home-salon.co.uk

# Optional: CC admin on all bookings
EMAIL_CC=admin@christinas-home-salon.co.uk
```

### Getting a Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your domain (or use Resend's test domain for development)
4. Add the API key to `.env.local`

### Testing Without Resend

If `RESEND_API_KEY` is not set, emails will be logged to the console instead of sent.

---

## 7. Common Configuration Tasks

### Task: Change Cut & Blow-Dry Price

1. Open `src/content/services.ts`
2. Find `id: 'cut-blow-dry'`
3. Change `price: 35` to your new price
4. Save and restart dev server

### Task: Add a New Service Area

1. Open `src/lib/pricing/config.ts`
2. Add postcodes to `POSTCODE_DISTANCES` with estimated distances
3. Verify the distance falls within your travel tiers

### Task: Disable Group Booking

1. Open `src/lib/pricing/config.ts`
2. Set `groupBooking.enabled: false`

### Task: Change Booking Confirmation Email

1. Open `src/app/api/booking/route.ts`
2. Modify the email template in the `sendBookingEmail` function

---

## 8. Validation & Testing

After making configuration changes:

1. **Restart the dev server**: `npm run dev`
2. **Run type checking**: `npm run type-check`
3. **Run tests**: `npm run test:unit`
4. **Test the booking flow** manually to verify changes

---

## Need Help?

If you're unsure about a configuration change, check:

1. The TypeScript types in each config file for required fields
2. The test files in `tests/unit/` for expected behavior
3. The existing examples in each configuration file
