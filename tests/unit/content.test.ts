import { describe, it, expect } from 'vitest';
import { SERVICES, getServiceById, getServiceOptionById } from '@/content/services';
import { PACKAGES, getPackageById } from '@/content/packages';
import { FAQS, getFAQsByCategory } from '@/content/faqs';
import { REVIEWS, getReviewsByService, getAverageRating, getReviewCount } from '@/content/reviews';
import { BUSINESS_INFO } from '@/content/business';
import { SERVICE_BOUNDARIES, WOMEN_ONLY_STATEMENT } from '@/content/boundaries';

describe('Content Data', () => {
  describe('Services', () => {
    it('should have at least 3 service categories', () => {
      expect(SERVICES.length).toBeGreaterThanOrEqual(3);
    });

    it('should find service by id', () => {
      const service = getServiceById('hairdressing');
      expect(service).toBeDefined();
      expect(service?.id).toBe('hairdressing');
    });

    it('should return undefined for unknown service', () => {
      const service = getServiceById('unknown');
      expect(service).toBeUndefined();
    });

    it('should find service option by id', () => {
      // Get first option from first service
      const firstService = SERVICES[0];
      const firstOption = firstService.options[0];
      const found = getServiceOptionById(firstOption.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstOption.id);
    });

    it('each service should have required properties', () => {
      SERVICES.forEach((service) => {
        expect(service.id).toBeDefined();
        expect(service.title).toBeDefined();
        expect(service.description).toBeDefined();
        expect(service.icon).toBeDefined();
        expect(Array.isArray(service.options)).toBe(true);
        expect(service.options.length).toBeGreaterThan(0);
      });
    });

    it('each service option should have required properties', () => {
      SERVICES.forEach((service) => {
        service.options.forEach((option) => {
          expect(option.id).toBeDefined();
          expect(option.name).toBeDefined();
          expect(typeof option.price).toBe('number');
          expect(option.price).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Packages', () => {
    it('should have at least one package', () => {
      expect(PACKAGES.length).toBeGreaterThan(0);
    });

    it('should find package by id', () => {
      const firstPackage = PACKAGES[0];
      const found = getPackageById(firstPackage.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstPackage.id);
    });

    it('each package should have required properties', () => {
      PACKAGES.forEach((pkg) => {
        expect(pkg.id).toBeDefined();
        expect(pkg.name).toBeDefined();
        expect(typeof pkg.price).toBe('number');
        expect(Array.isArray(pkg.includes)).toBe(true);
      });
    });
  });

  describe('FAQs', () => {
    it('should have FAQs', () => {
      expect(FAQS.length).toBeGreaterThan(0);
    });

    it('should filter FAQs by category', () => {
      const generalFaqs = getFAQsByCategory('general');
      expect(Array.isArray(generalFaqs)).toBe(true);
    });

    it('each FAQ should have question and answer', () => {
      FAQS.forEach((faq) => {
        expect(faq.question).toBeDefined();
        expect(faq.question.length).toBeGreaterThan(0);
        expect(faq.answer).toBeDefined();
        expect(faq.answer.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Reviews', () => {
    it('should have reviews', () => {
      expect(REVIEWS.length).toBeGreaterThan(0);
    });

    it('should calculate average rating', () => {
      const avg = getAverageRating();
      expect(avg).toBeGreaterThanOrEqual(1);
      expect(avg).toBeLessThanOrEqual(5);
    });

    it('should return correct review count', () => {
      const count = getReviewCount();
      expect(count).toBe(REVIEWS.length);
    });

    it('should filter reviews by service', () => {
      const hairdressingReviews = getReviewsByService('hairdressing');
      expect(Array.isArray(hairdressingReviews)).toBe(true);
      hairdressingReviews.forEach((review) => {
        expect(review.service).toBe('hairdressing');
      });
    });

    it('each review should have required properties', () => {
      REVIEWS.forEach((review) => {
        expect(review.id).toBeDefined();
        expect(review.name).toBeDefined();
        expect(review.text).toBeDefined();
        expect(typeof review.rating).toBe('number');
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Business Info', () => {
    it('should have all required business information', () => {
      expect(BUSINESS_INFO.name).toBeDefined();
      expect(BUSINESS_INFO.contact.phone).toBeDefined();
      expect(BUSINESS_INFO.contact.email).toBeDefined();
      expect(BUSINESS_INFO.serviceArea.areas.length).toBeGreaterThan(0);
    });

    it('should have valid opening hours', () => {
      expect(BUSINESS_INFO.hours.weekdays).toBeDefined();
      expect(BUSINESS_INFO.hours.saturday).toBeDefined();
      expect(BUSINESS_INFO.hours.sunday).toBeDefined();
    });

    it('should have trust signals', () => {
      expect(BUSINESS_INFO.trust.length).toBeGreaterThan(0);
    });
  });

  describe('Service Boundaries', () => {
    it('should have excluded categories', () => {
      expect(Array.isArray(SERVICE_BOUNDARIES.excluded)).toBe(true);
      expect(SERVICE_BOUNDARIES.excluded.length).toBeGreaterThan(0);
    });

    it('should have included services for companionship', () => {
      expect(SERVICE_BOUNDARIES.included).toBeDefined();
      expect(SERVICE_BOUNDARIES.included.companionship).toBeDefined();
      expect(Array.isArray(SERVICE_BOUNDARIES.included.companionship.items)).toBe(true);
    });

    it('each excluded category should have items', () => {
      SERVICE_BOUNDARIES.excluded.forEach((category) => {
        expect(category.category).toBeDefined();
        expect(Array.isArray(category.items)).toBe(true);
        expect(category.items.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Women Only Statement', () => {
    it('should have all statement variations', () => {
      expect(WOMEN_ONLY_STATEMENT.short).toBeDefined();
      expect(WOMEN_ONLY_STATEMENT.medium).toBeDefined();
      expect(WOMEN_ONLY_STATEMENT.full).toBeDefined();
      expect(WOMEN_ONLY_STATEMENT.booking).toBeDefined();
      expect(WOMEN_ONLY_STATEMENT.why).toBeDefined();
    });
  });
});
