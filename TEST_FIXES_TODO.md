# Test Fixes Required

## Current Status
- ✅ data-testid attributes added to all booking wizard steps
- ✅ clock.ts helper created for deterministic time
- ✅ rate-limit.ts module created and integrated
- ✅ test/request.ts helper created for API tests
- ⚠️  3 test failures remaining

## Failures to Fix

### 1. API Booking Test - Server-side Pricing
**File:** tests/unit/api-booking.test.ts
**Issue:** Test expects server to ignore client's tampered total (999999) but server uses it
**Fix:** The booking route needs to fetch the actual service price from services.ts instead of using client total

**Location:** src/app/api/booking/route.ts line ~180
**Current:**
```typescript
const priceInput: BookingPriceInput = {
  servicePrice: booking.total - booking.travelFee, // ❌ Uses client total
  // ...
};
```

**Should be:**
```typescript
// Get actual service price from service catalog
const service = getServiceById(booking.serviceType);
const option = getServiceOptionById(booking.selectedOption);
const actualPrice = option?.price || 0;

const priceInput: BookingPriceInput = {
  servicePrice: actualPrice, // ✅ Server-determined price
  // ...
};
```

### 2. ICS Test - Special Requests
**File:** tests/unit/ics.test.ts
**Issue:** Test expects special requests in description, but ICS might not be including it properly

**Action:** Check createBookingICS function to ensure specialRequests parameter is used in DESCRIPTION field

### 3. ICS Test - Parse Validation
**File:** tests/unit/ics.test.ts
**Issue:** Test checks if ICS ends with END:VCALENDAR but failing

**Action:** Ensure ICS output has proper CRLF line endings and ends with END:VCALENDAR\r\n

## Next Steps

1. Fix server-side pricing in booking route
2. Verify ICS includes special requests in description
3. Fix ICS line endings
4. Run `npm run test -- --run` to verify all pass
5. Run `npm run test:e2e` to test Playwright tests
