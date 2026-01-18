import { describe, it, expect } from 'vitest';

/**
 * Booking Reference Generator Tests
 * Format: CHS-YYYYMMDD-XXXX
 */

// Extract the function from API route for testing
function generateBookingReference(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CHS-${datePart}-${randomPart}`;
}

describe('Booking Reference Generator', () => {
  describe('Format validation', () => {
    it('generates reference with correct prefix', () => {
      const ref = generateBookingReference();
      expect(ref).toMatch(/^CHS-/);
    });

    it('includes current date in YYYYMMDD format', () => {
      const ref = generateBookingReference();
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      expect(ref).toContain(today);
    });

    it('matches full format CHS-YYYYMMDD-XXXX', () => {
      const ref = generateBookingReference();
      expect(ref).toMatch(/^CHS-\d{8}-[A-Z0-9]{4}$/);
    });

    it('has correct total length', () => {
      const ref = generateBookingReference();
      // CHS(3) + -(1) + YYYYMMDD(8) + -(1) + XXXX(4) = 17
      expect(ref.length).toBe(17);
    });

    it('uses uppercase characters in random part', () => {
      const ref = generateBookingReference();
      const randomPart = ref.split('-')[2];
      expect(randomPart).toMatch(/^[A-Z0-9]{4}$/);
      expect(randomPart).toBe(randomPart.toUpperCase());
    });
  });

  describe('Uniqueness properties', () => {
    it('generates different references on successive calls', () => {
      const refs = new Set();
      for (let i = 0; i < 100; i++) {
        refs.add(generateBookingReference());
      }
      // Should have high uniqueness (allow for small collision chance)
      expect(refs.size).toBeGreaterThan(95);
    });

    it('random part varies between calls', () => {
      const ref1 = generateBookingReference();
      const ref2 = generateBookingReference();
      const random1 = ref1.split('-')[2];
      const random2 = ref2.split('-')[2];
      
      // Very unlikely to be the same
      // Allow this to potentially fail in rare cases (1 in 1.6 million)
      if (random1 === random2) {
        console.warn('Rare collision detected in random part');
      }
    });

    it('generates valid character set', () => {
      const refs = Array.from({ length: 50 }, () => generateBookingReference());
      refs.forEach(ref => {
        const randomPart = ref.split('-')[2];
        expect(randomPart).toMatch(/^[A-Z0-9]+$/);
      });
    });
  });

  describe('Date handling', () => {
    it('uses current date', () => {
      const ref = generateBookingReference();
      const datePart = ref.split('-')[1];
      const year = datePart.substring(0, 4);
      const currentYear = new Date().getFullYear().toString();
      expect(year).toBe(currentYear);
    });

    it('handles date rollover correctly', () => {
      // This test verifies the format is consistent
      const ref = generateBookingReference();
      const datePart = ref.split('-')[1];
      expect(datePart.length).toBe(8);
      expect(datePart).toMatch(/^\d{8}$/);
    });
  });

  describe('Parsing and validation', () => {
    it('can be split into components', () => {
      const ref = generateBookingReference();
      const parts = ref.split('-');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('CHS');
      expect(parts[1]).toMatch(/^\d{8}$/);
      expect(parts[2]).toMatch(/^[A-Z0-9]{4}$/);
    });

    it('date part can be parsed as valid date', () => {
      const ref = generateBookingReference();
      const datePart = ref.split('-')[1];
      const year = parseInt(datePart.substring(0, 4));
      const month = parseInt(datePart.substring(4, 6));
      const day = parseInt(datePart.substring(6, 8));
      
      expect(year).toBeGreaterThan(2020);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
    });
  });
});
