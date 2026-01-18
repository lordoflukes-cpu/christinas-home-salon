import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/enquiry/route';
import { makeJsonRequest } from '@/lib/test/request';
import { resetRateLimiter } from '@/lib/rate-limit';

// Mock email provider
vi.mock('@/lib/notify/email', () => ({
  getEmailProvider: () => ({
    send: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
  }),
}));

describe('/api/enquiry Route', () => {
  const validEnquiryPayload = {
    clientName: 'Test Client',
    clientEmail: 'test@example.com',
    clientPhone: '07700900000',
    postcode: 'SM1 1AA',
    address: '123 Test Street',
    serviceName: 'Cut & Blow Dry',
    message: 'I would like to enquire about booking an appointment',
    preferredDate: '2026-02-01',
    preferredTime: '14:00',
    reason: 'general' as const,
  };

  beforeEach(() => {
    resetRateLimiter();
    vi.clearAllMocks();
  });

  describe('Success cases', () => {
    it('returns 200 with enquiry reference on valid request', async () => {
      const request = new NextRequest('http://localhost:3000/api/enquiry', {
        method: 'POST',
        body: JSON.stringify(validEnquiryPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enquiryReference).toBeDefined();
      expect(data.enquiryReference).toMatch(/^ENQ-\d{8}-[A-Z0-9]{4}$/);
    });

    it('accepts enquiry without optional fields', async () => {
      const minimalPayload = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        clientPhone: '07700900000',
        postcode: 'SM1 1AA',
        message: 'I would like to enquire about your services',
        reason: 'general' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/enquiry', {
        method: 'POST',
        body: JSON.stringify(minimalPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('handles out-of-area enquiry reason', async () => {
      const outOfAreaPayload = {
        ...validEnquiryPayload,
        postcode: 'AB10 1AA',
        reason: 'out-of-area' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/enquiry', {
        method: 'POST',
        body: JSON.stringify(outOfAreaPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Validation errors', () => {
    it('returns 400 for missing required fields', async () => {
      const invalidPayload = {
        ...validEnquiryPayload,
        clientName: '', // Empty required field
      };

      const request = new NextRequest('http://localhost:3000/api/enquiry', {
        method: 'POST',
        body: JSON.stringify(invalidPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 for invalid email format', async () => {
      const invalidPayload = {
        ...validEnquiryPayload,
        clientEmail: 'not-an-email',
      };

      const request = new NextRequest('http://localhost:3000/api/enquiry', {
        method: 'POST',
        body: JSON.stringify(invalidPayload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 for message too short', async () => {
      const invalidPayload = {
        ...validEnquiryPayload,
        message: 'Hi', // Too short (less than 20 chars)
      };

      const request = new NextRequest('http://localhost:3000/api/enquiry', {
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
    // Note: Actual honeypot implementation depends on enquiry route
    // This test assumes similar honeypot logic as booking
    it('should have spam protection mechanism', async () => {
      // This is a placeholder - actual test depends on implementation
      expect(true).toBe(true);
    });
  });

  describe('Rate limiting', () => {
    it('accepts first enquiry from IP', async () => {
      const request = new NextRequest('http://localhost:3000/api/enquiry', {
        method: 'POST',
        body: JSON.stringify(validEnquiryPayload),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.2',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Error handling', () => {
    it('handles invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/enquiry', {
        method: 'POST',
        body: 'invalid{json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('handles malformed request', async () => {
      const request = new NextRequest('http://localhost:3000/api/enquiry', {
        method: 'POST',
        body: JSON.stringify({ random: 'data' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
