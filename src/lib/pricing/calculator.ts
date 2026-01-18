import { PRICING_CONFIG, POSTCODE_DISTANCES, type TravelTier } from './config';

export interface ServiceAreaResult {
  isInArea: boolean;
  distanceMiles: number | null;
  travelFee: number;
  travelTier: TravelTier | null;
  minimumBookingMinutes: number;
  message: string;
  requiresEnquiry?: boolean; // True if beyond max radius
}

export interface PriceBreakdownItem {
  label: string;
  amount: number;
  type: 'service' | 'addon' | 'travel' | 'surcharge' | 'discount' | 'package' | 'adjustment';
}

export interface PriceBreakdown {
  servicePrice: number;
  travelFee: number;
  subtotal: number;
  total: number;
  savings?: number;
  items: PriceBreakdownItem[];
  minimumChargeApplied: boolean;
  depositRequired: boolean;
  depositAmount: number;
  estimatedDuration: number; // Total duration in minutes
}

export interface BookingPriceInput {
  serviceId?: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  addOns?: { id: string; name: string; price: number; duration: number }[];
  travelFee: number;
  hairLengthSurcharge?: boolean;
  isSameDay?: boolean;
  isNewClient?: boolean;
  isColourService?: boolean;
  additionalClients?: { serviceId: string; serviceName: string; price: number; duration: number }[];
  packageDiscount?: { amount: number; label: string };
}

/**
 * Extract postcode prefix from full postcode
 * Handles formats like "CM1 1AA", "CM11AA", "CM1", "cm1 1aa"
 */
export function extractPostcodePrefix(postcode: string): string {
  // Normalize: uppercase, remove spaces
  const normalized = postcode.toUpperCase().replace(/\s+/g, '');
  
  // UK postcodes: 1-2 letters, 1-2 numbers, optional space, number, 2 letters
  // We want the outward code (before the space or last 3 characters)
  
  // If it's just the prefix (e.g., "CM1"), return it
  if (normalized.length <= 4) {
    return normalized;
  }
  
  // Otherwise, extract outward code (everything except last 3 characters)
  return normalized.slice(0, -3);
}

/**
 * Get estimated distance for a postcode
 * Returns null if postcode prefix is not recognized
 */
export function getDistanceForPostcode(postcode: string): number | null {
  const prefix = extractPostcodePrefix(postcode);
  
  // Try exact match first
  if (prefix in POSTCODE_DISTANCES) {
    return POSTCODE_DISTANCES[prefix];
  }
  
  // Try shorter prefix (e.g., "CM11" -> "CM1")
  const shorterPrefix = prefix.replace(/\d+$/, (match) => match.slice(0, 1));
  if (shorterPrefix !== prefix && shorterPrefix in POSTCODE_DISTANCES) {
    return POSTCODE_DISTANCES[shorterPrefix];
  }
  
  // Try even shorter (just letters + first digit)
  const letters = prefix.match(/^[A-Z]+/)?.[0] || '';
  const firstDigit = prefix.match(/\d/)?.[0] || '';
  const minimalPrefix = letters + firstDigit;
  
  if (minimalPrefix in POSTCODE_DISTANCES) {
    return POSTCODE_DISTANCES[minimalPrefix];
  }
  
  return null;
}

/**
 * Get travel tier for a given distance
 */
export function getTravelTier(distanceMiles: number): TravelTier | null {
  return PRICING_CONFIG.travelTiers.find(
    (tier) => distanceMiles >= tier.minMiles && distanceMiles <= tier.maxMiles
  ) || null;
}

/**
 * Calculate travel fee for a given distance
 */
export function calculateTravelFee(distanceMiles: number): number {
  const tier = getTravelTier(distanceMiles);
  return tier?.fee ?? 0;
}

/**
 * Check if a postcode is within the service area
 */
export function checkServiceArea(postcode: string): ServiceAreaResult {
  const distance = getDistanceForPostcode(postcode);
  
  // Unknown postcode
  if (distance === null) {
    return {
      isInArea: false,
      distanceMiles: null,
      travelFee: 0,
      travelTier: null,
      minimumBookingMinutes: PRICING_CONFIG.minimumBookingMinutes,
      message: "Sorry, I couldn't recognise that postcode. Please contact me directly to check if I cover your area.",
      requiresEnquiry: true,
    };
  }
  
  // Out of service area - redirect to enquiry
  if (distance > PRICING_CONFIG.maxServiceRadiusMiles) {
    return {
      isInArea: false,
      distanceMiles: distance,
      travelFee: 0,
      travelTier: null,
      minimumBookingMinutes: PRICING_CONFIG.minimumBookingMinutes,
      message: `Your area is beyond my usual ${PRICING_CONFIG.maxServiceRadiusMiles}-mile service radius. I may still be able to help by special arrangement – let's discuss!`,
      requiresEnquiry: true,
    };
  }
  
  // In service area
  const tier = getTravelTier(distance);
  const isDistant = distance > PRICING_CONFIG.distantThresholdMiles;
  const minimumBookingMinutes = isDistant
    ? PRICING_CONFIG.minimumBookingMinutesDistant
    : PRICING_CONFIG.minimumBookingMinutes;
  
  let message = `Great news! You're within my service area.`;
  
  if (tier && tier.fee > 0) {
    message += ` A £${tier.fee} travel fee applies for your location.`;
  } else {
    message += ` No travel fee applies – you're in my core area.`;
  }
  
  if (isDistant) {
    message += ` Note: A minimum ${minimumBookingMinutes / 60}-hour booking applies for your area.`;
  }
  
  return {
    isInArea: true,
    distanceMiles: distance,
    travelFee: tier?.fee ?? 0,
    travelTier: tier,
    minimumBookingMinutes,
    message,
    requiresEnquiry: false,
  };
}

/**
 * Calculate full price breakdown for a booking
 * Handles: base service, add-ons, surcharges, travel, discounts, minimum charge
 */
export function calculatePriceBreakdown(
  servicePrice: number,
  serviceName: string,
  travelFee: number,
  packageDiscount?: { amount: number; label: string }
): PriceBreakdown {
  const items: PriceBreakdownItem[] = [
    { label: serviceName, amount: servicePrice, type: 'service' },
  ];
  
  if (travelFee > 0) {
    items.push({ label: 'Travel fee', amount: travelFee, type: 'travel' });
  }
  
  let subtotal = servicePrice + travelFee;
  let total = subtotal;
  let savings: number | undefined;
  
  if (packageDiscount) {
    items.push({ label: packageDiscount.label, amount: -packageDiscount.amount, type: 'discount' });
    total -= packageDiscount.amount;
    savings = packageDiscount.amount;
  }
  
  // Apply minimum charge if needed
  let minimumChargeApplied = false;
  if (total < PRICING_CONFIG.minimumCharge) {
    const adjustment = PRICING_CONFIG.minimumCharge - total;
    items.push({ label: 'Minimum appointment adjustment', amount: adjustment, type: 'adjustment' });
    total = PRICING_CONFIG.minimumCharge;
    minimumChargeApplied = true;
  }
  
  return {
    servicePrice,
    travelFee,
    subtotal,
    total,
    savings,
    items,
    minimumChargeApplied,
    depositRequired: false,
    depositAmount: 0,
    estimatedDuration: 0,
  };
}

/**
 * Calculate comprehensive price breakdown with all options
 */
export function calculateFullPriceBreakdown(input: BookingPriceInput): PriceBreakdown {
  const items: PriceBreakdownItem[] = [];
  let totalDuration = input.serviceDuration;
  
  // Main service
  items.push({ 
    label: input.serviceName, 
    amount: input.servicePrice, 
    type: 'service' 
  });
  
  // Add-ons
  if (input.addOns && input.addOns.length > 0) {
    for (const addon of input.addOns) {
      items.push({ 
        label: addon.name, 
        amount: addon.price, 
        type: 'addon' 
      });
      totalDuration += addon.duration;
    }
  }
  
  // Additional clients (group booking)
  let groupDiscount = 0;
  if (input.additionalClients && input.additionalClients.length > 0) {
    const { groupBooking } = PRICING_CONFIG;
    
    for (const client of input.additionalClients) {
      items.push({ 
        label: `Additional: ${client.serviceName}`, 
        amount: client.price, 
        type: 'service' 
      });
      totalDuration += client.duration;
    }
    
    // Apply group discount
    if (groupBooking.enabled) {
      const eligibleCount = input.additionalClients.length;
      groupDiscount = eligibleCount * groupBooking.discountPerClient;
      if (groupDiscount > 0) {
        items.push({ 
          label: `Group discount (${eligibleCount} additional)`, 
          amount: -groupDiscount, 
          type: 'discount' 
        });
      }
    }
  }
  
  // Hair length surcharge
  if (input.hairLengthSurcharge && PRICING_CONFIG.surcharges.hairLength.enabled) {
    items.push({ 
      label: PRICING_CONFIG.surcharges.hairLength.label, 
      amount: PRICING_CONFIG.surcharges.hairLength.amount, 
      type: 'surcharge' 
    });
  }
  
  // Same-day surcharge
  if (input.isSameDay && PRICING_CONFIG.surcharges.sameDay.enabled) {
    items.push({ 
      label: PRICING_CONFIG.surcharges.sameDay.label, 
      amount: PRICING_CONFIG.surcharges.sameDay.amount, 
      type: 'surcharge' 
    });
  }
  
  // Travel fee
  if (input.travelFee > 0) {
    items.push({ label: 'Travel fee', amount: input.travelFee, type: 'travel' });
  }
  
  // Package discount
  let packageSavings: number | undefined;
  if (input.packageDiscount) {
    items.push({ 
      label: input.packageDiscount.label, 
      amount: -input.packageDiscount.amount, 
      type: 'discount' 
    });
    packageSavings = input.packageDiscount.amount;
  }
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  let total = subtotal;
  
  // Apply minimum charge if needed
  let minimumChargeApplied = false;
  if (total < PRICING_CONFIG.minimumCharge) {
    const adjustment = PRICING_CONFIG.minimumCharge - total;
    items.push({ label: 'Minimum appointment adjustment', amount: adjustment, type: 'adjustment' });
    total = PRICING_CONFIG.minimumCharge;
    minimumChargeApplied = true;
  }
  
  // Determine if deposit required
  let depositRequired = false;
  let depositAmount = 0;
  
  if (PRICING_CONFIG.deposit.enabled) {
    const { requiredFor, amount, isPercentage } = PRICING_CONFIG.deposit;
    
    if (
      requiredFor.includes('all') ||
      (requiredFor.includes('new-client') && input.isNewClient) ||
      (requiredFor.includes('colour') && input.isColourService)
    ) {
      depositRequired = true;
      depositAmount = isPercentage ? Math.round((total * amount) / 100) : amount;
    }
  }
  
  // Calculate total savings
  const savings = (packageSavings ?? 0) + groupDiscount;
  
  return {
    servicePrice: input.servicePrice,
    travelFee: input.travelFee,
    subtotal,
    total,
    savings: savings > 0 ? savings : undefined,
    items,
    minimumChargeApplied,
    depositRequired,
    depositAmount,
    estimatedDuration: totalDuration,
  };
}

/**
 * Validate postcode format (basic UK postcode validation)
 */
export function isValidUKPostcode(postcode: string): boolean {
  // Basic UK postcode regex - not exhaustive but catches most issues
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
  return postcodeRegex.test(postcode.trim());
}

/**
 * Format postcode for display (uppercase with space)
 */
export function formatPostcode(postcode: string): string {
  const normalized = postcode.toUpperCase().replace(/\s+/g, '');
  if (normalized.length <= 4) {
    return normalized;
  }
  // Insert space before last 3 characters
  return `${normalized.slice(0, -3)} ${normalized.slice(-3)}`;
}
