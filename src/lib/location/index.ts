/**
 * Location and Service Area Enforcement
 * Handles postcode normalization, travel tier calculation, and service area validation
 */

import { BUSINESS_INFO } from '@/content/business';
import { POSTCODE_DISTANCES } from '@/lib/pricing/config';

export interface TravelTier {
  tierId: string;
  label: string;
  fee: number;
  withinCoreRadius: boolean;
  enquiryOnly: boolean;
  distanceMiles: number | null;
}

/**
 * Normalize UK postcode to standard format
 * Examples: "sm1 1aa" -> "SM1 1AA", "  SW19  " -> "SW19"
 */
export function normalizePostcode(postcode: string): string {
  return postcode.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * Extract postcode district (first part before space or numbers)
 * Examples: "SM1 1AA" -> "SM1", "SW19" -> "SW19"
 */
export function extractPostcodeDistrict(postcode: string): string {
  const normalized = normalizePostcode(postcode);
  // Match the district part (letters + optional number)
  const match = normalized.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/);
  return match ? match[1] : normalized.split(' ')[0];
}

/**
 * Get travel tier for a given postcode
 */
export function getTravelTier(postcode: string): TravelTier {
  const district = extractPostcodeDistrict(postcode);
  const distanceMiles = POSTCODE_DISTANCES[district] ?? null;
  
  if (distanceMiles === null) {
    // Unknown postcode - default to enquiry only
    return {
      tierId: 'beyond',
      label: 'Beyond service area',
      fee: 0,
      withinCoreRadius: false,
      enquiryOnly: true,
      distanceMiles: null,
    };
  }
  
  // Find matching tier
  for (const tier of BUSINESS_INFO.travelTiers) {
    if (distanceMiles >= tier.minMiles && distanceMiles <= tier.maxMiles) {
      return {
        tierId: tier.id,
        label: tier.label,
        fee: tier.fee,
        withinCoreRadius: distanceMiles <= (BUSINESS_INFO.coreRadiusMiles || 6),
        enquiryOnly: tier.enquiryOnly || false,
        distanceMiles,
      };
    }
  }

  // Fallback to beyond tier (outside max service radius)
  const maxTier = BUSINESS_INFO.travelTiers[BUSINESS_INFO.travelTiers.length - 1];
  return {
    tierId: 'beyond',
    label: 'Beyond service area',
    fee: 0,
    withinCoreRadius: false,
    enquiryOnly: distanceMiles > maxTier.maxMiles,
    distanceMiles,
  };
}

/**
 * Check if a postcode is serviceable (not enquiry-only)
 */
export function isServiceable(postcode: string): boolean {
  const tier = getTravelTier(postcode);
  return !tier.enquiryOnly;
}

/**
 * Get friendly message for service area status
 */
export function getServiceAreaMessage(postcode: string): string {
  const tier = getTravelTier(postcode);
  
  if (tier.enquiryOnly) {
    return `This postcode is outside our standard service area (${tier.distanceMiles ? `${tier.distanceMiles} miles` : 'unknown distance'}). We may still be able to help - please send an enquiry.`;
  }
  
  if (tier.withinCoreRadius) {
    return `Great news! You're in our core service area with no travel fee.`;
  }
  
  return `You're in our ${tier.label.toLowerCase()} with a £${tier.fee} travel fee.`;
}
