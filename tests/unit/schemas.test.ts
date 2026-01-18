import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  postcodeSchema,
  phoneSchema,
  emailSchema,
  serviceSelectionSchema,
  locationSchema,
  dateTimeSchema,
  clientDetailsSchema,
  contactFormSchema,
} from '@/lib/schema/booking-schema';

describe('Booking Schemas', () => {
  describe('postcodeSchema', () => {
    it('should validate correct UK postcodes', () => {
      expect(postcodeSchema.safeParse('SM1 1AA').success).toBe(true);
      expect(postcodeSchema.safeParse('SM1 4AB').success).toBe(true);
      expect(postcodeSchema.safeParse('SW1A 1AA').success).toBe(true);
    });

    it('should reject invalid postcodes', () => {
      expect(postcodeSchema.safeParse('').success).toBe(false);
      expect(postcodeSchema.safeParse('123').success).toBe(false);
      expect(postcodeSchema.safeParse('ABCDEF').success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should validate UK phone numbers', () => {
      expect(phoneSchema.safeParse('07700 900000').success).toBe(true);
      expect(phoneSchema.safeParse('07700900000').success).toBe(true);
      expect(phoneSchema.safeParse('+447700900000').success).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(phoneSchema.safeParse('123').success).toBe(false);
      expect(phoneSchema.safeParse('').success).toBe(false);
      expect(phoneSchema.safeParse('not a phone').success).toBe(false);
    });
  });

  describe('emailSchema', () => {
    it('should validate correct emails', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
      expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(emailSchema.safeParse('').success).toBe(false);
      expect(emailSchema.safeParse('not-an-email').success).toBe(false);
      expect(emailSchema.safeParse('missing@domain').success).toBe(false);
    });
  });

  describe('serviceSelectionSchema', () => {
    it('should validate valid service types', () => {
      expect(serviceSelectionSchema.safeParse({ serviceType: 'hairdressing' }).success).toBe(true);
      expect(serviceSelectionSchema.safeParse({ serviceType: 'companion' }).success).toBe(true);
      expect(serviceSelectionSchema.safeParse({ serviceType: 'errands' }).success).toBe(true);
      expect(serviceSelectionSchema.safeParse({ serviceType: 'packages' }).success).toBe(true);
    });

    it('should reject invalid service types', () => {
      expect(serviceSelectionSchema.safeParse({ serviceType: '' }).success).toBe(false);
      expect(serviceSelectionSchema.safeParse({ serviceType: 'invalid' }).success).toBe(false);
    });
  });

  describe('locationSchema', () => {
    it('should validate location data', () => {
      const validData = {
        postcode: 'SM1 1AA',
        address: '123 Test Street, Sutton',
      };
      expect(locationSchema.safeParse(validData).success).toBe(true);
    });

    it('should require mandatory fields', () => {
      expect(locationSchema.safeParse({}).success).toBe(false);
      expect(locationSchema.safeParse({ postcode: 'SM1' }).success).toBe(false);
    });
  });

  describe('dateTimeSchema', () => {
    it('should validate date and time', () => {
      const validData = {
        selectedDate: '2025-02-01',
        selectedTime: '10:00',
      };
      expect(dateTimeSchema.safeParse(validData).success).toBe(true);
    });

    it('should reject missing fields', () => {
      expect(dateTimeSchema.safeParse({ selectedDate: '2025-02-01' }).success).toBe(false);
      expect(dateTimeSchema.safeParse({ selectedTime: '10:00' }).success).toBe(false);
    });
  });

  describe('clientDetailsSchema', () => {
    it('should validate client details with consents', () => {
      const validData = {
        clientName: 'Jane Smith',
        clientEmail: 'jane@example.com',
        clientPhone: '07700 900000',
        specialRequests: '',
        consentWomenOnly: true,
        consentBoundaries: true,
        consentCancellation: true,
      };
      expect(clientDetailsSchema.safeParse(validData).success).toBe(true);
    });

    it('should require all consent checkboxes', () => {
      const missingConsent = {
        clientName: 'Jane Smith',
        clientEmail: 'jane@example.com',
        clientPhone: '07700 900000',
        consentWomenOnly: true,
        consentBoundaries: false,
        consentCancellation: true,
      };
      expect(clientDetailsSchema.safeParse(missingConsent).success).toBe(false);
    });

    it('should require name, email, and phone', () => {
      const missingFields = {
        consentWomenOnly: true,
        consentBoundaries: true,
        consentCancellation: true,
      };
      expect(clientDetailsSchema.safeParse(missingFields).success).toBe(false);
    });
  });

  describe('contactFormSchema', () => {
    it('should validate complete contact form', () => {
      const validData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '07700 900000',
        subject: 'General Enquiry',
        message: 'Hello, I have a question about your services.',
        acceptedPolicy: true,
      };
      expect(contactFormSchema.safeParse(validData).success).toBe(true);
    });

    it('should allow empty phone', () => {
      const validData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '',
        subject: 'General Enquiry',
        message: 'Hello, I have a question about your services.',
        acceptedPolicy: true,
      };
      expect(contactFormSchema.safeParse(validData).success).toBe(true);
    });

    it('should require policy acceptance', () => {
      const notAccepted = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'General Enquiry',
        message: 'Hello, I have a question!',
        acceptedPolicy: false,
      };
      expect(contactFormSchema.safeParse(notAccepted).success).toBe(false);
    });
  });
});
