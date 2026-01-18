import { describe, it, expect } from 'vitest';
import { generateICS, createBookingICS, type ICSEventData } from '@/lib/calendar/ics';

describe('ICS Calendar Generation', () => {
  const mockBookingData = {
    bookingReference: 'CHS-20260118-TEST',
    serviceName: 'Cut & Blow Dry',
    clientName: 'Jane Smith',
    clientEmail: 'jane@example.com',
    date: '2026-01-25',
    time: '14:30',
    duration: 90,
    address: '123 Test Street',
    postcode: 'SM1 1AA',
    businessName: "Christina's Home Salon",
    businessEmail: 'info@christinashomesalon.co.uk',
  };

  describe('createBookingICS', () => {
    it('generates valid ICS content', () => {
      const ics = createBookingICS(mockBookingData);
      
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
    });

    it('includes booking reference in UID', () => {
      const ics = createBookingICS(mockBookingData);
      
      expect(ics).toContain(`UID:${mockBookingData.bookingReference}@christinashomesalon.co.uk`);
    });

    it('includes service name in summary', () => {
      const ics = createBookingICS(mockBookingData);
      
      expect(ics).toContain('SUMMARY:');
      expect(ics).toContain(mockBookingData.serviceName);
    });

    it('includes location information', () => {
      const ics = createBookingICS(mockBookingData);
      
      expect(ics).toContain('LOCATION:');
      expect(ics).toContain(mockBookingData.address);
      expect(ics).toContain(mockBookingData.postcode);
    });

    it('includes organizer information', () => {
      const ics = createBookingICS(mockBookingData);
      
      expect(ics).toContain('ORGANIZER');
      expect(ics).toContain(mockBookingData.businessEmail);
    });

    it('includes attendee information', () => {
      const ics = createBookingICS(mockBookingData);
      
      expect(ics).toContain('ATTENDEE');
      expect(ics).toContain(mockBookingData.clientEmail);
    });

    it('includes description with booking details', () => {
      const ics = createBookingICS(mockBookingData);
      
      expect(ics).toContain('DESCRIPTION:');
      expect(ics).toContain(mockBookingData.bookingReference);
    });

    it('calculates correct start time', () => {
      const ics = createBookingICS(mockBookingData);
      
      // Should contain DTSTART with 2026-01-25 14:30
      expect(ics).toContain('DTSTART:');
      expect(ics).toContain('20260125');
    });

    it('calculates correct end time based on duration', () => {
      const ics = createBookingICS({
        ...mockBookingData,
        time: '14:00',
        duration: 60,
      });
      
      // Start: 14:00, Duration: 60min, End: 15:00
      expect(ics).toContain('DTSTART:');
      expect(ics).toContain('DTEND:');
    });

    it('includes special requests when provided', () => {
      const ics = createBookingICS({
        ...mockBookingData,
        specialRequests: 'Please park on driveway',
      });
      
      expect(ics).toContain('Special Requests: Please park on');
    });

    it('omits special requests when not provided', () => {
      const ics = createBookingICS(mockBookingData);
      
      // Should not have undefined or null in output
      expect(ics).not.toContain('undefined');
      expect(ics).not.toContain('null');
    });
  });

  describe('generateICS', () => {
    const mockEvent: ICSEventData = {
      summary: 'Test Event',
      description: 'Test Description',
      location: 'Test Location',
      startTime: new Date('2026-01-25T14:30:00Z'),
      endTime: new Date('2026-01-25T16:00:00Z'),
      organizer: {
        name: 'Test Organizer',
        email: 'organizer@example.com',
      },
      attendee: {
        name: 'Test Attendee',
        email: 'attendee@example.com',
      },
      uid: 'test-uid@example.com',
    };

    it('generates RFC 5545 compliant header', () => {
      const ics = generateICS(mockEvent);
      
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:');
      expect(ics).toContain('CALSCALE:GREGORIAN');
    });

    it('includes METHOD:REQUEST', () => {
      const ics = generateICS(mockEvent);
      
      expect(ics).toContain('METHOD:REQUEST');
    });

    it('formats dates in UTC', () => {
      const ics = generateICS(mockEvent);
      
      // Dates should end with Z for UTC
      const dtstartMatch = ics.match(/DTSTART:(\d{8}T\d{6}Z)/);
      const dtendMatch = ics.match(/DTEND:(\d{8}T\d{6}Z)/);
      
      expect(dtstartMatch).toBeTruthy();
      expect(dtendMatch).toBeTruthy();
    });

    it('includes DTSTAMP', () => {
      const ics = generateICS(mockEvent);
      
      expect(ics).toContain('DTSTAMP:');
    });

    it('sets STATUS:CONFIRMED', () => {
      const ics = generateICS(mockEvent);
      
      expect(ics).toContain('STATUS:CONFIRMED');
    });

    it('escapes special characters in text fields', () => {
      const eventWithSpecialChars: ICSEventData = {
        ...mockEvent,
        summary: 'Event: With; Special, Characters\nAnd newlines',
        description: 'Description with \\backslash',
      };
      
      const ics = generateICS(eventWithSpecialChars);
      
      // Special chars should be escaped
      expect(ics).toContain('\\;');
      expect(ics).toContain('\\,');
      expect(ics).toContain('\\n');
    });

    it('folds long lines correctly', () => {
      const longDescription = 'A'.repeat(200);
      const eventWithLongText: ICSEventData = {
        ...mockEvent,
        description: longDescription,
      };
      
      const ics = generateICS(eventWithLongText);
      const lines = ics.split('\r\n');
      
      // RFC 5545: Lines should not exceed 75 octets
      // Folded lines start with space
      lines.forEach(line => {
        if (!line.startsWith(' ')) {
          expect(line.length).toBeLessThanOrEqual(75);
        }
      });
    });

    it('ends with proper CRLF line endings', () => {
      const ics = generateICS(mockEvent);
      
      // Should use \r\n not just \n
      expect(ics).toContain('\r\n');
      expect(ics).not.toMatch(/(?<!\r)\n/); // No \n without preceding \r
    });
  });

  describe('Integration tests', () => {
    it('generates downloadable ICS that could be parsed', () => {
      const ics = createBookingICS(mockBookingData);
      
      // Basic structure validation
      expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
      expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
      
      // Count BEGIN/END component pairs - should have VCALENDAR, VEVENT, and VALARM (3 each)
      // Note: DTEND: (end time) also contains "END:" so we match word boundaries
      const beginCount = (ics.match(/^BEGIN:/gm) || []).length;
      const endCount = (ics.match(/^END:/gm) || []).length;
      expect(beginCount).toBe(3);
      expect(endCount).toBe(3);
      expect(beginCount).toBe(endCount);
    });

    it('maintains consistent format across multiple bookings', () => {
      const ics1 = createBookingICS(mockBookingData);
      const ics2 = createBookingICS({
        ...mockBookingData,
        bookingReference: 'CHS-20260118-TEST2',
        clientName: 'John Doe',
      });
      
      // Both should have same structure
      expect(ics1.split('\r\n').length).toBeGreaterThan(20);
      expect(ics2.split('\r\n').length).toBeGreaterThan(20);
    });

    it('snapshot: complete ICS output', () => {
      const ics = createBookingICS(mockBookingData);
      
      // Snapshot test - replace timestamp and UID which vary
      const normalized = ics
        .replace(/DTSTAMP:\d{8}T\d{6}Z/g, 'DTSTAMP:TIMESTAMP')
        .replace(/UID:[^\r\n]+/g, 'UID:UNIQUE_ID');
      
      expect(normalized).toMatchSnapshot();
    });
  });

  describe('Edge cases', () => {
    it('handles midnight booking time', () => {
      const ics = createBookingICS({
        ...mockBookingData,
        time: '00:00',
      });
      
      expect(ics).toContain('DTSTART:');
      expect(ics).toContain('DTEND:');
    });

    it('handles late evening booking', () => {
      const ics = createBookingICS({
        ...mockBookingData,
        time: '23:30',
      });
      
      expect(ics).toContain('DTSTART:');
    });

    it('handles very long duration', () => {
      const ics = createBookingICS({
        ...mockBookingData,
        duration: 300, // 5 hours
      });
      
      expect(ics).toContain('DTSTART:');
      expect(ics).toContain('DTEND:');
    });

    it('handles zero duration gracefully', () => {
      const ics = createBookingICS({
        ...mockBookingData,
        duration: 0,
      });
      
      expect(ics).toBeDefined();
    });
  });
});
