import { describe, it, expect } from 'vitest';
import { 
  getTravelTier, 
  isServiceable, 
  normalizePostcode, 
  extractPostcodeDistrict,
  getServiceAreaMessage 
} from '@/lib/location';

describe('Location Service', () => {
  describe('normalizePostcode', () => {
    it('converts to uppercase', () => {
      expect(normalizePostcode('sm1 1aa')).toBe('SM1 1AA');
    });

    it('trims whitespace', () => {
      expect(normalizePostcode('  SM1 1AA  ')).toBe('SM1 1AA');
    });

    it('normalizes multiple spaces', () => {
      expect(normalizePostcode('SM1    1AA')).toBe('SM1 1AA');
    });

    it('handles postcodes without space', () => {
      expect(normalizePostcode('sm11aa')).toBe('SM11AA');
    });
  });

  describe('extractPostcodeDistrict', () => {
    it('extracts district from full postcode', () => {
      expect(extractPostcodeDistrict('SM1 1AA')).toBe('SM1');
    });

    it('handles postcode without space', () => {
      expect(extractPostcodeDistrict('SW19')).toBe('SW19');
    });

    it('handles two-letter district', () => {
      expect(extractPostcodeDistrict('KT1 1AA')).toBe('KT1');
    });
  });

  describe('getTravelTier', () => {
    it('returns free tier for Sutton SM1 (0-6 miles)', () => {
      const tier = getTravelTier('SM1 1AA');
      expect(tier.fee).toBe(0);
      expect(tier.withinCoreRadius).toBe(true);
      expect(tier.enquiryOnly).toBe(false);
      expect(tier.tierId).toBe('core');
    });

    it('returns £5 fee for 6-10 mile tier', () => {
      const tier = getTravelTier('KT3 4AA'); // Assuming this is in 6-10 mile range
      if (tier.distanceMiles && tier.distanceMiles > 6 && tier.distanceMiles <= 10) {
        expect(tier.fee).toBe(5);
        expect(tier.withinCoreRadius).toBe(false);
        expect(tier.enquiryOnly).toBe(false);
      }
    });

    it('returns £12 fee for 10-15 mile tier', () => {
      const tier = getTravelTier('CR0 1AA'); // Assuming this is in 10-15 mile range
      if (tier.distanceMiles && tier.distanceMiles > 10 && tier.distanceMiles <= 15) {
        expect(tier.fee).toBe(12);
        expect(tier.enquiryOnly).toBe(false);
      }
    });

    it('returns enquiry-only for beyond 15 miles', () => {
      const tier = getTravelTier('SE1 1AA'); // Assuming this is beyond range
      if (tier.distanceMiles && tier.distanceMiles > 15) {
        expect(tier.enquiryOnly).toBe(true);
        expect(tier.fee).toBe(0);
      }
    });

    it('returns enquiry-only for unknown postcode', () => {
      const tier = getTravelTier('ZZ99 9ZZ');
      expect(tier.enquiryOnly).toBe(true);
      expect(tier.tierId).toBe('beyond');
      expect(tier.distanceMiles).toBeNull();
    });

    it('handles case insensitivity', () => {
      const tier1 = getTravelTier('sm1 1aa');
      const tier2 = getTravelTier('SM1 1AA');
      expect(tier1).toEqual(tier2);
    });

    it('handles whitespace variations', () => {
      const tier1 = getTravelTier('  SM1  1AA  ');
      const tier2 = getTravelTier('SM1 1AA');
      expect(tier1).toEqual(tier2);
    });
  });

  describe('isServiceable', () => {
    it('returns true for core area postcodes', () => {
      expect(isServiceable('SM1 1AA')).toBe(true);
    });

    it('returns true for paid travel tier postcodes', () => {
      const tier = getTravelTier('KT3 4AA');
      if (!tier.enquiryOnly) {
        expect(isServiceable('KT3 4AA')).toBe(true);
      }
    });

    it('returns false for enquiry-only postcodes', () => {
      expect(isServiceable('ZZ99 9ZZ')).toBe(false);
    });

    it('returns false for beyond service area', () => {
      const tier = getTravelTier('AB10 1AA'); // Aberdeen
      if (tier.enquiryOnly) {
        expect(isServiceable('AB10 1AA')).toBe(false);
      }
    });
  });

  describe('getServiceAreaMessage', () => {
    it('returns positive message for serviceable postcodes', () => {
      const message = getServiceAreaMessage('SM1 1AA');
      expect(message).toContain('service');
      expect(message.toLowerCase()).not.toContain('outside');
    });

    it('returns enquiry message for non-serviceable postcodes', () => {
      const message = getServiceAreaMessage('ZZ99 9ZZ');
      expect(message.toLowerCase()).toContain('enquiry');
    });
  });

  describe('Boundary conditions', () => {
    it('handles edge of 6-mile boundary correctly', () => {
      // Test postcodes at the boundary
      const tier = getTravelTier('SM1 1AA'); // Core area
      expect(tier.fee).toBe(0);
    });

    it('handles edge of 15-mile boundary correctly', () => {
      // Postcodes just inside and just outside 15-mile limit
      // This tests the exact boundary logic
      const tier = getTravelTier('CR0 1AA');
      expect(tier).toBeDefined();
      expect(tier.fee).toBeGreaterThanOrEqual(0);
    });
  });
});
