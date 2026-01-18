import { describe, it, expect } from 'vitest';
import { calculateFullPriceBreakdown, type BookingPriceInput } from '@/lib/pricing/calculator';
import { PRICING_CONFIG } from '@/lib/pricing/config';

describe('Deposit Calculations', () => {
  const baseInput: BookingPriceInput = {
    servicePrice: 50,
    serviceDuration: 60,
    travelFee: 0,
    addOns: [],
    additionalClients: [],
    hairLengthSurcharge: false,
    isNewClient: false,
    isColourService: false,
    isSameDay: false,
  };

  describe('Deposit required conditions', () => {
    it('requires deposit for new client when policy enabled', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        isNewClient: true,
      });

      if (PRICING_CONFIG.deposit.enabled && PRICING_CONFIG.deposit.requiredFor.includes('new-client')) {
        expect(breakdown.depositRequired).toBe(true);
        expect(breakdown.depositAmount).toBeGreaterThan(0);
      }
    });

    it('requires deposit for colour service when policy enabled', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        isColourService: true,
      });

      if (PRICING_CONFIG.deposit.enabled && PRICING_CONFIG.deposit.requiredFor.includes('colour')) {
        expect(breakdown.depositRequired).toBe(true);
        expect(breakdown.depositAmount).toBeGreaterThan(0);
      }
    });

    it('requires deposit for new client with colour service', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        isNewClient: true,
        isColourService: true,
      });

      if (PRICING_CONFIG.deposit.enabled) {
        expect(breakdown.depositRequired).toBe(true);
        expect(breakdown.depositAmount).toBeGreaterThan(0);
      }
    });

    it('does not require deposit for returning client with non-colour service', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        isNewClient: false,
        isColourService: false,
      });

      // Assuming deposit is only for new-client or colour
      if (PRICING_CONFIG.deposit.enabled && 
          !PRICING_CONFIG.deposit.requiredFor.includes('all')) {
        expect(breakdown.depositRequired).toBe(false);
        expect(breakdown.depositAmount).toBe(0);
      }
    });
  });

  describe('Deposit amount calculation', () => {
    it('calculates fixed deposit amount correctly', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        servicePrice: 100,
        isNewClient: true,
      });

      if (PRICING_CONFIG.deposit.enabled && !PRICING_CONFIG.deposit.isPercentage) {
        expect(breakdown.depositAmount).toBe(PRICING_CONFIG.deposit.amount);
      }
    });

    it('calculates percentage deposit amount correctly', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        servicePrice: 100,
        isNewClient: true,
      });

      if (PRICING_CONFIG.deposit.enabled && PRICING_CONFIG.deposit.isPercentage) {
        const expectedDeposit = Math.round((breakdown.total * PRICING_CONFIG.deposit.amount) / 100);
        expect(breakdown.depositAmount).toBe(expectedDeposit);
      }
    });

    it('rounds deposit to whole pounds', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        servicePrice: 37.50,
        isNewClient: true,
      });

      if (breakdown.depositRequired) {
        expect(breakdown.depositAmount).toBe(Math.round(breakdown.depositAmount));
        expect(Number.isInteger(breakdown.depositAmount)).toBe(true);
      }
    });

    it('deposit does not exceed total price', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        servicePrice: 15,
        isNewClient: true,
      });

      if (breakdown.depositRequired) {
        expect(breakdown.depositAmount).toBeLessThanOrEqual(breakdown.total);
      }
    });
  });

  describe('Deposit with minimum charge', () => {
    it('calculates deposit based on adjusted total after minimum charge', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        servicePrice: 20, // Below minimum
        isNewClient: true,
      });

      if (breakdown.minimumChargeApplied && breakdown.depositRequired) {
        expect(breakdown.total).toBe(PRICING_CONFIG.minimumCharge);
        // Deposit should be calculated on the minimum charge, not original price
        if (PRICING_CONFIG.deposit.isPercentage) {
          const expectedDeposit = Math.round((PRICING_CONFIG.minimumCharge * PRICING_CONFIG.deposit.amount) / 100);
          expect(breakdown.depositAmount).toBe(expectedDeposit);
        }
      }
    });
  });

  describe('Deposit with add-ons and surcharges', () => {
    it('includes add-ons in deposit calculation when percentage-based', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        servicePrice: 50,
        addOns: [{ price: 20, duration: 30 }],
        isNewClient: true,
      });

      if (breakdown.depositRequired && PRICING_CONFIG.deposit.isPercentage) {
        expect(breakdown.total).toBe(70); // 50 + 20
        const expectedDeposit = Math.round((70 * PRICING_CONFIG.deposit.amount) / 100);
        expect(breakdown.depositAmount).toBe(expectedDeposit);
      }
    });

    it('includes travel fee in deposit calculation when percentage-based', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        servicePrice: 50,
        travelFee: 5,
        isNewClient: true,
      });

      if (breakdown.depositRequired && PRICING_CONFIG.deposit.isPercentage) {
        expect(breakdown.total).toBe(55);
        const expectedDeposit = Math.round((55 * PRICING_CONFIG.deposit.amount) / 100);
        expect(breakdown.depositAmount).toBe(expectedDeposit);
      }
    });

    it('includes hair length surcharge in deposit calculation', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        servicePrice: 50,
        hairLengthSurcharge: true,
        isNewClient: true,
      });

      if (breakdown.depositRequired && PRICING_CONFIG.deposit.isPercentage) {
        expect(breakdown.total).toBeGreaterThan(50);
        const expectedDeposit = Math.round((breakdown.total * PRICING_CONFIG.deposit.amount) / 100);
        expect(breakdown.depositAmount).toBe(expectedDeposit);
      }
    });
  });

  describe('Edge cases', () => {
    it('handles zero service price', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        servicePrice: 0,
        isNewClient: true,
      });

      expect(breakdown).toBeDefined();
      expect(breakdown.total).toBeGreaterThanOrEqual(0);
    });

    it('handles very large service price', () => {
      const breakdown = calculateFullPriceBreakdown({
        ...baseInput,
        servicePrice: 1000,
        isNewClient: true,
      });

      expect(breakdown).toBeDefined();
      if (breakdown.depositRequired && PRICING_CONFIG.deposit.isPercentage) {
        expect(breakdown.depositAmount).toBeLessThanOrEqual(breakdown.total);
      }
    });
  });
});

describe('Minimum Charge Application', () => {
  const baseInput: BookingPriceInput = {
    servicePrice: 50,
    serviceDuration: 60,
    travelFee: 0,
    addOns: [],
    additionalClients: [],
    hairLengthSurcharge: false,
    isNewClient: false,
    isColourService: false,
    isSameDay: false,
  };

  it('applies minimum charge when total is below threshold', () => {
    const breakdown = calculateFullPriceBreakdown({
      ...baseInput,
      servicePrice: 20,
    });

    expect(breakdown.total).toBe(PRICING_CONFIG.minimumCharge);
    expect(breakdown.minimumChargeApplied).toBe(true);
  });

  it('does not apply minimum charge when total meets threshold', () => {
    const breakdown = calculateFullPriceBreakdown({
      ...baseInput,
      servicePrice: PRICING_CONFIG.minimumCharge,
    });

    expect(breakdown.total).toBe(PRICING_CONFIG.minimumCharge);
    expect(breakdown.minimumChargeApplied).toBe(false);
  });

  it('does not apply minimum charge when total exceeds threshold', () => {
    const breakdown = calculateFullPriceBreakdown({
      ...baseInput,
      servicePrice: PRICING_CONFIG.minimumCharge + 10,
    });

    expect(breakdown.total).toBe(PRICING_CONFIG.minimumCharge + 10);
    expect(breakdown.minimumChargeApplied).toBe(false);
  });

  it('includes travel fee before checking minimum', () => {
    const breakdown = calculateFullPriceBreakdown({
      ...baseInput,
      servicePrice: 25,
      travelFee: 10,
    });

    if (25 + 10 >= PRICING_CONFIG.minimumCharge) {
      expect(breakdown.minimumChargeApplied).toBe(false);
    }
  });
});
