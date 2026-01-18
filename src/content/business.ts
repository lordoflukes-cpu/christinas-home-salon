/**
 * Business Information
 * Central source of truth for all business details
 * 
 * Christina's Home Salon - Personal and professional mobile hairdressing
 * Based in Sutton, Surrey
 */

export interface TrustSignal {
  icon: string;
  title: string;
  description: string;
}

export const BUSINESS_INFO = {
  name: "Christina's Home Salon",
  tagline: 'Mobile Hairdressing & Companionship Services',
  owner: 'Christina',
  
  // Contact - Use dedicated business contacts, not personal
  contact: {
    phone: '07XXX XXXXXX', // TODO: Replace with dedicated business number
    email: 'hello@christinashomesalon.co.uk',
    whatsapp: '07XXX XXXXXX', // TODO: Same as phone or separate WhatsApp Business number
  },
  
  // Location - Based in Sutton, Surrey
  basePostcode: 'SM1',
  baseTown: 'Sutton',
  county: 'Surrey',
  country: 'United Kingdom',
  
  // Business hours - Part-time, appointment-based
  hours: {
    weekdays: { open: '09:00', close: '18:00' },
    saturday: { open: '09:00', close: '16:00' },
    sunday: { status: 'Closed' },
    note: 'Part-time hours – appointments by booking only',
  },
  
  // Service area configuration
  serviceArea: {
    region: 'Sutton & surrounding areas',
    radiusFree: '6 miles',
    radiusMax: '15 miles',
    description: 'Free travel within 6 miles of Sutton; small fee beyond',
    areas: [
      'Sutton',
      'Cheam', 
      'Belmont',
      'Carshalton',
      'Wallington',
      'Worcester Park',
      'Morden',
      'New Malden',
      'Croydon',
      'Kingston',
      'Wimbledon',
      'Epsom',
      'Banstead',
    ],
  },
  
  // Social media - Business profiles only (not personal)
  social: {
    facebook: 'https://facebook.com/christinashomesalon', // TODO: Create Facebook Business Page
    instagram: 'https://instagram.com/christinashomesalon', // TODO: Create Instagram Business account
  },
  
  // Trust signals and credentials
  trust: [
    {
      icon: '🛡️',
      title: 'DBS Checked',
      description: 'Enhanced DBS certificate for your peace of mind and safety',
    },
    {
      icon: '📋',
      title: 'Fully Insured',
      description: 'Public liability and professional indemnity insurance',
    },
    {
      icon: '🎓',
      title: 'NVQ Level 2 Qualified',
      description: 'Professionally trained hairdresser with recognised qualifications',
    },
    {
      icon: '💜',
      title: 'Women & Girls Only',
      description: 'Exclusively serving women and girls for your comfort',
    },
    {
      icon: '🏠',
      title: 'Home Visits',
      description: 'Professional salon experience in the comfort of your home',
    },
    {
      icon: '⭐',
      title: 'Personal Service',
      description: 'One-to-one attention with no rushing between clients',
    },
  ] as TrustSignal[],
  
  // Pricing minimums
  minimumCharge: 30, // Minimum call-out fee in GBP
  
  // Website
  url: 'https://christinas-home-salon.co.uk', // TODO: Update with real domain
} as const;

// Format business hours for display
export function formatBusinessHours(): { day: string; hours: string }[] {
  return [
    { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];
}

// Check if currently open (simplified - doesn't account for holidays)
export function isCurrentlyOpen(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  
  if (day === 0) return false; // Sunday closed
  if (day === 6) return hour >= 9 && hour < 16; // Saturday 9am-4pm
  return hour >= 9 && hour < 18; // Weekdays 9am-6pm
}

// Contact hours formatted for display
export const CONTACT_HOURS = {
  availability: 'Mon-Fri 9am-6pm, Sat 9am-4pm',
  responseTime: 'I aim to respond within 24 hours',
  preferredContact: 'Phone or WhatsApp for quickest response',
};

// Bank holiday note
export const BANK_HOLIDAY_NOTE = 'Bank holidays may have limited availability – please book in advance';

export type BusinessInfo = typeof BUSINESS_INFO;
