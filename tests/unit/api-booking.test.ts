import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/booking/route';
import { makeJsonRequest } from '@/lib/test/request';
import { resetRateLimiter } from '@/lib/rate-limit';

// Mock email provider
vi.mock('@/lib/notify/email', () => ({
  getEmailProvider: () => ({
    send: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
  }),
}));

describe('/api/booking Route', () => {
  const validBookingPayload = {
    website: '', // Honeypot - must be empty
    serviceType: 'hairdressing',
    selectedOption: 'cut-blow-dry',
    serviceName: 'Hairdressing',
    optionName: 'Cut & Blow Dry',
    addOns: [],
    hairLengthSurcharge: false,
    additionalClients: [],
    timeBasedSelection: null,
    postcode: 'SM1 1AA',
    address: '123 Test Street',
    travelFee: 0,
    selectedDate: '2026-02-01',
    selectedTime: '14:00',
    isSameDay: false,
    clientName: 'Test Client',
    clientEmail: 'test@example.com',
    clientPhone: '07700900000',
    specialRequests: '',
    isNewClient: true,
    consentBoundaries: true,
    consentCancellation: true,
    consentWomenOnly: true,
    total: 45,
    depositRequired: true,
    depositAmount: 20,
    estimatedDuration: 60,
    isColourService: false,
  };

  beforeEach(() => {
    // Clear rate limit between tests
    resetRateLimiter();
    vi.clearAllMocks();
  });

  describe('Success cases', () => {
    it('returns 200 with booking reference on valid request', async () => {
      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(validBookingPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.bookingReference).toBeDefined();
      expect(data.bookingReference).toMatch(/^CHS-\d{8}-[A-Z0-9]{4}$/);
      expect(data.total).toBeDefined();
      expect(data.depositRequired).toBeDefined();
      expect(data.depositAmount).toBeDefined();
    });

    it('calculates pricing server-side (ignores client totals)', async () => {
      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          ...validBookingPayload,
          total: 999999, // Client tampered amount
          depositAmount: 999999,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Server should recalculate, not use client's 999999
      expect(data.total).not.toBe(999999);
      expect(data.total).toBeGreaterThan(0);
      expect(data.total).toBeLessThan(1000);
    });

    it('returns deposit information when required', async () => {
      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          ...validBookingPayload,
          isNewClient: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.depositRequired) {
        expect(data.depositAmount).toBeGreaterThan(0);
      }
    });
  });

  describe('Validation errors', () => {
    it('returns 400 for missing required fields', async () => {
      const invalidPayload = {
        ...validBookingPayload,
        clientName: '', // Missing required field
      };

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(invalidPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('returns 400 for invalid email', async () => {
      const invalidPayload = {
        ...validBookingPayload,
        clientEmail: 'not-an-email',
      };

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(invalidPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('returns 400 for missing consents', async () => {
      const invalidPayload = {
        ...validBookingPayload,
        consentBoundaries: false,
      };

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(invalidPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Honeypot spam protection', () => {
    it('rejects request when honeypot field is filled', async () => {
      const spamPayload = {
        ...validBookingPayload,
        website: 'https://spam.com', // Bot filled honeypot
      };

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(spamPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('Rate limiting', () => {
    it('accepts first request within rate limit', async () => {
      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(validBookingPayload),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.1',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    // Note: Actual rate limit test requires injecting rate limiter or time control
    // This is a basic structure - full test would need rate limiter abstraction
  });

  describe('Out-of-area handling', () => {
    it('returns enquiry-only status for non-serviceable postcode', async () => {
      const outOfAreaPayload = {
        ...validBookingPayload,
        postcode: 'AB10 1AA', // Aberdeen - way out of area
      };

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(outOfAreaPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      // Should reject with enquiry-only message
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.enquiryOnly).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('returns 500 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: 'invalid json{',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it('handles malformed request gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({ random: 'data' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(600);
    });
  });
});
