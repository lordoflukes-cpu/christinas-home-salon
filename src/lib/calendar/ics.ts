/**
 * ICS Calendar Generation
 * 
 * Generates .ics calendar files for booking confirmations
 * Follows RFC 5545 iCalendar specification
 */

export interface ICSEventData {
  summary: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  organizer?: {
    name: string;
    email: string;
  };
  attendee?: {
    name: string;
    email: string;
  };
  uid?: string;
}

/**
 * Format date for ICS (YYYYMMDDTHHmmssZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters in ICS fields
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold long lines (max 75 octets per line per RFC 5545)
 */
function foldLine(line: string): string {
  if (line.length <= 75) {
    return line;
  }
  
  const lines: string[] = [];
  let currentLine = line;
  
  while (currentLine.length > 75) {
    lines.push(currentLine.substring(0, 75));
    currentLine = ' ' + currentLine.substring(75);
  }
  
  if (currentLine.trim().length > 0) {
    lines.push(currentLine);
  }
  
  return lines.join('\r\n');
}

/**
 * Generate ICS calendar event
 */
export function generateICS(event: ICSEventData): string {
  const now = new Date();
  const uid = event.uid || `${Date.now()}@christinashomesalon.co.uk`;
  
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Christina\'s Home Salon//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(event.startTime)}`,
    `DTEND:${formatICSDate(event.endTime)}`,
    `SUMMARY:${escapeICS(event.summary)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    `LOCATION:${escapeICS(event.location)}`,
    'STATUS:CONFIRMED',
  ];
  
  if (event.organizer) {
    lines.push(
      `ORGANIZER;CN=${escapeICS(event.organizer.name)}:mailto:${event.organizer.email}`
    );
  }
  
  if (event.attendee) {
    lines.push(
      `ATTENDEE;CN=${escapeICS(event.attendee.name)};RSVP=TRUE:mailto:${event.attendee.email}`
    );
  }
  
  lines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Hair appointment tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );
  
  // Fold lines and join with CRLF, ensure trailing CRLF
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/**
 * Download ICS file client-side
 */
export function downloadICS(icsContent: string, filename: string = 'booking.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Create booking event ICS
 */
export function createBookingICS(bookingData: {
  bookingReference: string;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  duration: number; // minutes
  address: string;
  postcode: string;
  businessName: string;
  businessEmail: string;
  specialRequests?: string;
}): string {
  // Parse date and time
  const [hours, minutes] = bookingData.time.split(':').map(Number);
  const startTime = new Date(bookingData.date);
  startTime.setHours(hours, minutes, 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + bookingData.duration);
  
  // Build description
  const descriptionParts = [
    `Booking Reference: ${bookingData.bookingReference}`,
    `Service: ${bookingData.serviceName}`,
    '',
    `Location: ${bookingData.address}, ${bookingData.postcode}`,
  ];
  
  if (bookingData.specialRequests) {
    descriptionParts.push('', `Special Requests: ${bookingData.specialRequests}`);
  }
  
  descriptionParts.push(
    '',
    'Please ensure someone is home to let me in.',
    'I look forward to seeing you!',
    '',
    `- ${bookingData.businessName}`
  );
  
  const event: ICSEventData = {
    summary: `Hair Appointment: ${bookingData.serviceName}`,
    description: descriptionParts.join('\n'),
    location: `${bookingData.address}, ${bookingData.postcode}`,
    startTime,
    endTime,
    organizer: {
      name: bookingData.businessName,
      email: bookingData.businessEmail,
    },
    attendee: {
      name: bookingData.clientName,
      email: bookingData.clientEmail,
    },
    uid: `${bookingData.bookingReference}@christinashomesalon.co.uk`,
  };
  
  return generateICS(event);
}
