import { describe, it, expect } from 'vitest';
import {
  checkServiceArea,
  calculateTravelFee,
  calculatePriceBreakdown,
  calculateFullPriceBreakdown,
} from '@/lib/pricing/calculator';
import { PRICING_CONFIG } from '@/lib/pricing/config';

describe('Pricing Calculator', () => {
  describe('checkServiceArea', () => {
    it('should return true for postcodes in service area', () => {
      expect(checkServiceArea('SM1').isInArea).toBe(true);
      expect(checkServiceArea('SM2').isInArea).toBe(true);
      expect(checkServiceArea('SM3').isInArea).toBe(true);
    });

    it('should return false for postcodes outside service area', () => {
      expect(checkServiceArea('EC1').isInArea).toBe(false);
      expect(checkServiceArea('XX99').isInArea).toBe(false);
    });

    it('should return requiresEnquiry for out-of-area postcodes', () => {
      const result = checkServiceArea('XX99');
      expect(result.isInArea).toBe(false);
      expect(result.requiresEnquiry).toBe(true);
    });

    it('should normalize postcode format', () => {
      expect(checkServiceArea('sm1').isInArea).toBe(true);
      expect(checkServiceArea('SM1 1AA').isInArea).toBe(true);
      expect(checkServiceArea('  sm1  ').isInArea).toBe(true);
    });

    it('should return correct tier for postcodes', () => {
      const result = checkServiceArea('SM1');
      expect(result.travelTier?.label).toContain('Core');
      
      const result2 = checkServiceArea('SW19');
      expect(result2.travelTier?.label).toContain('Extended');
    });
  });

  describe('calculateTravelFee', () => {
    it('should return 0 for core tier (0-6 miles)', () => {
      expect(calculateTravelFee(0)).toBe(0);
      expect(calculateTravelFee(3)).toBe(0);
      expect(calculateTravelFee(5)).toBe(0);
    });

    it('should return fee for extended tier (6-10 miles)', () => {
      const fee = calculateTravelFee(8);
      expect(fee).toBeGreaterThan(0);
    });

    it('should return higher fee for distant tier (10-15 miles)', () => {
      const fee = calculateTravelFee(12);
      expect(fee).toBeGreaterThan(5);
    });
  });

  describe('calculatePriceBreakdown', () => {
    it('should calculate correct total for core tier', () => {
      const breakdown = calculatePriceBreakdown(35, 'Cut & Blow-Dry', 0);
      expect(breakdown.servicePrice).toBe(35);
      expect(breakdown.travelFee).toBe(0);
      expect(breakdown.total).toBe(35);
    });

    it('should include travel fee for extended tier', () => {
      const travelFee = calculateTravelFee(8);
      const breakdown = calculatePriceBreakdown(35, 'Cut & Blow-Dry', travelFee);
      expect(breakdown.servicePrice).toBe(35);
      expect(breakdown.travelFee).toBe(travelFee);
      expect(breakdown.total).toBe(35 + travelFee);
    });

    it('should apply package discount when provided', () => {
      const breakdown = calculatePriceBreakdown(50, 'Hair & Help Package', 0, { amount: 10, label: 'Package Discount' });
      expect(breakdown.total).toBe(40);
      expect(breakdown.savings).toBe(10);
    });

    it('should apply minimum charge when total is below threshold', () => {
      const breakdown = calculatePriceBreakdown(20, 'Quick Service', 0);
      expect(breakdown.total).toBe(PRICING_CONFIG.minimumCharge);
      expect(breakdown.minimumChargeApplied).toBe(true);
    });
  });

  describe('calculateFullPriceBreakdown', () => {
    it('should calculate base service with travel fee', () => {
      const breakdown = calculateFullPriceBreakdown({
        servicePrice: 45,
        serviceName: 'Cut & Blow-Dry',
        serviceDuration: 60,
        travelFee: 5,
      });
      expect(breakdown.total).toBe(50);
      expect(breakdown.estimatedDuration).toBe(60);
    });

    it('should include add-ons in total', () => {
      const breakdown = calculateFullPriceBreakdown({
        servicePrice: 45,
        serviceName: 'Cut & Blow-Dry',
        serviceDuration: 60,
        travelFee: 0,
        addOns: [
          { id: 'deep-condition', name: 'Deep Conditioning', price: 15, duration: 15 },
        ],
      });
      expect(breakdown.total).toBe(60);
      expect(breakdown.estimatedDuration).toBe(75);
    });

    it('should apply hair length surcharge when enabled', () => {
      const breakdown = calculateFullPriceBreakdown({
        servicePrice: 65,
        serviceName: 'Full Head Colour',
        serviceDuration: 90,
        travelFee: 0,
        hairLengthSurcharge: true,
      });
      expect(breakdown.total).toBe(65 + PRICING_CONFIG.surcharges.hairLength.amount);
    });

    it('should apply group discount for additional clients', () => {
      const breakdown = calculateFullPriceBreakdown({
        servicePrice: 45,
        serviceName: 'Cut & Blow-Dry',
        serviceDuration: 60,
        travelFee: 0,
        additionalClients: [
          { serviceName: 'Trim', serviceId: 'trim', price: 30, duration: 30 },
        ],
      });
      // Base 45 + Additional 30 - Group discount 5 = 70
      expect(breakdown.total).toBe(70);
      expect(breakdown.savings).toBe(PRICING_CONFIG.groupBooking.discountPerClient);
    });

    it('should require deposit for new clients', () => {
      const breakdown = calculateFullPriceBreakdown({
        servicePrice: 45,
        serviceName: 'Cut & Blow-Dry',
        serviceDuration: 60,
        travelFee: 0,
        isNewClient: true,
      });
      expect(breakdown.depositRequired).toBe(true);
      expect(breakdown.depositAmount).toBe(PRICING_CONFIG.deposit.amount);
    });

    it('should require deposit for colour services', () => {
      const breakdown = calculateFullPriceBreakdown({
        servicePrice: 65,
        serviceName: 'Full Head Colour',
        serviceDuration: 90,
        travelFee: 0,
        isColourService: true,
        isNewClient: false,
      });
      expect(breakdown.depositRequired).toBe(true);
    });

    it('should apply minimum charge when total is below threshold', () => {
      const breakdown = calculateFullPriceBreakdown({
        servicePrice: 15,
        serviceName: 'Small Service',
        serviceDuration: 20,
        travelFee: 0,
      });
      expect(breakdown.total).toBe(PRICING_CONFIG.minimumCharge);
      expect(breakdown.minimumChargeApplied).toBe(true);
    });
  });
});
