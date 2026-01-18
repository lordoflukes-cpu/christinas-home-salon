# Christina's Home Salon - Optimisation Plan

## Executive Summary

Upgrade from "excellent prototype" to "launch-ready v1" with:
- Crystal-clear service menu with durations
- Accurate service radius (CORE 6 miles from Sutton) + tiered travel fees
- Booking flow that handles time-based services, add-ons, minimums, and policies
- Stronger conversion UX (faster booking, clearer trust, easier contact)
- Config-driven pricing + durations (single source of truth)
- Working API backend for booking submissions

---

## Phase 1: Audit Results

### ✅ What's Working Well

1. **Content Structure** - Services, boundaries, and business info are well-organized with TypeScript types
2. **Travel Tier Logic** - Postcode-to-distance mapping exists with 3 tiers (Core/Extended/Distant)
3. **Booking Wizard** - 5-step flow is clean and uses Zustand for state management
4. **Women-Only Positioning** - Consistent throughout UI and content
5. **Boundary Language** - Companion/errands exclusions are clear and locked
6. **Design System** - shadcn/ui + Tailwind provides polished, accessible components

### 🔧 Gaps & Issues Found

#### Content & Data Model

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| Durations exist but inconsistent | Some services missing `durationNote` | All services need clear `durationMinutes` + optional `durationNote` | HIGH |
| Add-ons not integrated | Deep Conditioning exists but not selectable with other services | Add-on selection in booking wizard | HIGH |
| Time-based services static | Companionship has fixed 60/90/120 options | Dynamic duration selector in 30-min increments | HIGH |
| Hair length surcharge missing | No surcharge option | +£10 optional for colour services | MEDIUM |
| Same-day surcharge missing | No same-day pricing | +£10 optional for <24h bookings | LOW |

#### Pricing & Business Logic

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| Minimum charge display | Exists in config but not enforced in summary | Show "Minimum appointment adjustment" line item | HIGH |
| Beyond 15 miles handling | Returns "out of area" error | Redirect to contact/enquiry form | HIGH |
| Group booking not supported | Not implemented | Allow 1-3 additional clients + discount | MEDIUM |
| Deposit policy missing | Not captured | Capture depositRequired, depositAmount, paymentStatus | MEDIUM |

#### Booking Wizard

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| No add-on selection | Step 2 only shows main services | Include add-on checkboxes for eligible services | HIGH |
| No hair length question | Missing | Ask for colour/highlight services | MEDIUM |
| No time-based duration picker | Fixed options only | Slider or dropdown for 30-min increments | HIGH |
| No group booking flow | Missing | Toggle + additional client fields | MEDIUM |
| Out-of-area handling | Shows error, stops flow | Redirect to enquiry with prefilled data | HIGH |
| Summary missing minimum rule | Doesn't show adjustment | Show line item if subtotal < £30 | HIGH |
| No estimated end time | Shows duration only | Calculate and show end time | LOW |
| No calendar file | Missing | Generate .ics file on confirmation | LOW |

#### Backend & Submission

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| No API routes | Frontend only | `/api/booking` + `/api/enquiry` routes | HIGH |
| No email sending | N/A | Resend integration with fallback | HIGH |
| No consent capture | Missing | "consent to be contacted" checkbox | HIGH |

#### UX & Conversion

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| No postcode checker on homepage | Missing | "Check your area" widget | MEDIUM |
| No sticky mobile CTA | Missing | Bottom bar with Book + WhatsApp | MEDIUM |
| Service area examples missing | Not displayed | List example areas on Services/Booking pages | LOW |
| Service cards missing Book CTA | No direct booking link | Add "Book" button to each service card | MEDIUM |

#### SEO & Schema

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| JSON-LD incomplete | Basic schema | Full LocalBusiness with service area, priceRange, openingHours | LOW |
| Sitemap exists | Static XML in public | ✅ Keep as-is | N/A |

#### Tests

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| Travel tier tests basic | Only tests 3 scenarios | Expand to cover all tiers + edge cases | MEDIUM |
| No minimum charge tests | Missing | Test minimum enforcement logic | HIGH |
| No time-based pricing tests | Missing | Test hourly + increment calculations | HIGH |
| No group discount tests | Missing | Test multi-client discounts | MEDIUM |
| No E2E booking flow | Missing Playwright tests | Add full booking flow tests | MEDIUM |

---

## Phase 2: Implementation Checklist

### 2.1 Content & Data Model Updates

- [ ] Update `ServiceOption` type to include: `isTimeBased`, `hourlyRate`, `minDurationMinutes`, `incrementMinutes`
- [ ] Add `addOnFor` field to identify which services an add-on applies to
- [ ] Update all hairdressing services with exact durations per spec
- [ ] Add `SurchargeConfig` type for hair length and same-day surcharges
- [ ] Add `GroupBookingConfig` with discount rules

**Acceptance Criteria:**
- All services have `durationMinutes` field
- Deep Conditioning shows as selectable add-on for all hair services except dry trim
- Companionship/errands services have `isTimeBased: true` with hourly rate

### 2.2 Pricing Configuration Updates

- [ ] Add surcharge configs to `PRICING_CONFIG`
- [ ] Add group booking discount config
- [ ] Add deposit policy config
- [ ] Update `calculatePriceBreakdown` to handle: add-ons, surcharges, minimum charge, group discounts

**Acceptance Criteria:**
- `PRICING_CONFIG.surcharges.hairLength = 10`
- `PRICING_CONFIG.surcharges.sameDay = 10`
- `PRICING_CONFIG.groupDiscount.perAdditionalClient = 5`
- `PRICING_CONFIG.deposit = { requiredFor: ['new-client', 'colour'], amount: 20 }`

### 2.3 Booking Wizard Upgrades

- [ ] Step 2: Add checkbox for Deep Conditioning add-on (when applicable)
- [ ] Step 2: Add "Hair length/thickness" question for colour services
- [ ] Step 2: Add duration selector for time-based services (60/90/120/150+ mins)
- [ ] Step 2: Add group booking toggle + additional client fields
- [ ] Step 3: Redirect out-of-area to enquiry flow
- [ ] Step 4: Generate available time slots from business hours config
- [ ] Step 5: Add consent checkbox
- [ ] Summary: Show minimum charge adjustment line if needed
- [ ] Summary: Show estimated end time
- [ ] Confirmation: Add "Add to calendar" button

**Acceptance Criteria:**
- Booking with add-on shows correct total
- 90-min companionship shows £30 (1.5 × £20)
- Out-of-area postcode redirects to contact with prefilled enquiry
- Summary shows "Minimum appointment adjustment +£X" when subtotal < £30

### 2.4 API Routes

- [ ] Create `/api/booking` with Zod validation
- [ ] Create `/api/enquiry` for out-of-area and group requests
- [ ] Implement Resend email provider with console fallback
- [ ] Add rate limiting (basic)

**Acceptance Criteria:**
- POST `/api/booking` validates and sends email
- POST `/api/enquiry` handles out-of-area bookings
- Email contains all booking details

### 2.5 UX & Conversion Improvements

- [ ] Add postcode checker widget to homepage
- [ ] Add sticky mobile bottom bar (Book + WhatsApp)
- [ ] Add service area examples to Services and Booking pages
- [ ] Add "Book" CTA to service cards

**Acceptance Criteria:**
- Homepage postcode check links to booking with location prefilled
- Mobile sticky bar visible on scroll
- Service cards have direct booking links

### 2.6 SEO & Schema

- [ ] Update JSON-LD LocalBusiness schema
- [ ] Add service area description
- [ ] Add priceRange
- [ ] Add openingHours from config

### 2.7 Tests

- [ ] Add travel tier edge case tests
- [ ] Add minimum charge enforcement tests
- [ ] Add time-based price calculation tests
- [ ] Add group booking discount tests
- [ ] Add Playwright E2E: book haircut with add-on
- [ ] Add Playwright E2E: book companionship 90 mins
- [ ] Add Playwright E2E: out-of-area triggers enquiry

---

## Phase 3: Implementation Order

1. **Data Model** - Update types and services first (foundation)
2. **Pricing Logic** - Update calculator to handle new scenarios
3. **Booking Store** - Extend state for add-ons, surcharges, group booking
4. **Booking Wizard Steps** - Upgrade each step
5. **Summary Component** - Show full breakdown
6. **API Routes** - Add backend submission
7. **Homepage & UX** - Add postcode checker, sticky bar
8. **Tests** - Update unit tests, add E2E
9. **SEO** - Update schema

---

## Non-Negotiables Checklist

- [ ] Women-only positioning in ALL UI copy and content constants
- [ ] Companion/errand services strictly non-medical, non-personal-care
- [ ] No beauty add-ons beyond hair (only Deep Conditioning allowed)
- [ ] Mobile-first, fast, accessible, clean design
- [ ] No TypeScript errors
- [ ] All tests passing

---

## Success Metrics

- [ ] Booking flow completes successfully for all service types
- [ ] Travel fees calculate correctly for all tiers
- [ ] Minimum charge enforced and displayed
- [ ] Add-ons selectable and priced correctly
- [ ] Time-based services price dynamically
- [ ] Out-of-area redirects to enquiry
- [ ] Email sent on booking submission
- [ ] All existing tests pass
- [ ] New tests pass
