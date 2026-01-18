/**
 * Service Menu for Christina's Home Salon
 * 
 * Hairdressing: NVQ Level 2 services - cuts, styling, colouring for women of all ages
 * NOT offered: Perms, men's cuts, formal event/bridal styling
 * 
 * Companionship & Errands: Non-medical, non-personal care support services
 * 
 * CONFIGURATION: Edit services, prices, and durations below
 * See docs/CONFIG_GUIDE.md for detailed instructions
 */

export type ServiceCategory = 'hairdressing' | 'companionship' | 'errands' | 'packages';

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  durationNote?: string; // e.g., "plus processing time"
  price: number; // in GBP
  priceNote?: string; // e.g., "from", "per hour"
  popular?: boolean;
  
  // Add-on configuration
  isAddOn?: boolean;
  addOnFor?: ServiceCategory[]; // Which categories this add-on applies to
  
  // Time-based service configuration (for companionship/errands)
  isTimeBased?: boolean;
  hourlyRate?: number; // Rate per hour for time-based services
  minDurationMinutes?: number; // Minimum booking length
  incrementMinutes?: number; // Time increments (e.g., 30 for 30-min increments)
  
  // Surcharge eligibility
  hairLengthSurchargeEligible?: boolean; // Can this service have hair length surcharge?
}

export interface Service {
  id: ServiceCategory;
  title: string;
  subtitle: string;
  description: string;
  icon: string; // Lucide icon name
  image: string;
  color: string; // Tailwind color class
  options: ServiceOption[];
  includes: string[];
  excludes?: string[];
  note?: string;
}

export const SERVICES: Service[] = [
  {
    id: 'hairdressing',
    title: 'Mobile Hairdressing',
    subtitle: 'Professional salon services at home',
    description: 'Christina brings the salon experience to your home. NVQ Level 2 qualified hairdressing for women and girls of all ages. Enjoy professional cuts, styling, and colouring in the comfort and privacy of your own space.',
    icon: 'Scissors',
    image: '/images/hairdressing.jpg',
    color: 'rose',
    includes: [
      'Professional consultation',
      'Quality salon products',
      'Relaxed, unhurried service',
      'All equipment provided',
      'Gentle, patient approach',
    ],
    excludes: [
      'Perms',
      "Men's haircuts",
      'Formal event/bridal styling',
      'Hair extensions',
    ],
    options: [
      // ==================
      // CUTTING SERVICES
      // ==================
      {
        id: 'cut-blow-dry',
        name: 'Cut & Blow-Dry',
        description: 'Consultation, precision haircut tailored to your face shape and lifestyle, and professional blow-dry styling to finish.',
        duration: 60,
        price: 35,
        popular: true,
      },
      {
        id: 'dry-trim',
        name: 'Dry Trim (No Wash)',
        description: 'Quick trim of the ends or fringe on dry hair – perfect for maintaining your style between full appointments.',
        duration: 30,
        price: 20,
      },
      {
        id: 'wash-blow-dry',
        name: 'Wash & Blow-Dry',
        description: 'Relaxing shampoo followed by blow-dry styling into your desired look – smooth, volume, or curls.',
        duration: 45,
        price: 25,
      },
      {
        id: 'restyle-cut',
        name: 'Restyle Cut',
        description: 'For significant style changes (e.g., long to short). Includes wash, cut, and extra styling time for your new look.',
        duration: 75,
        price: 45,
      },
      
      // ==================
      // COLOUR SERVICES
      // (Hair length surcharge may apply)
      // ==================
      {
        id: 'root-colour',
        name: 'Root Colour Touch-Up',
        description: 'Professional colour coverage for regrowth at the roots. Includes application, processing, rinse and blow-dry.',
        duration: 90,
        durationNote: 'includes 30-45 min processing',
        price: 40,
        popular: true,
        hairLengthSurchargeEligible: true,
      },
      {
        id: 'full-colour',
        name: 'Full Head Colour',
        description: 'Complete all-over permanent or semi-permanent colour, finished with a professional blow-dry.',
        duration: 120,
        durationNote: 'includes processing time',
        price: 55,
        priceNote: 'from',
        hairLengthSurchargeEligible: true,
      },
      {
        id: 'partial-highlights',
        name: 'Partial Highlights / Foils',
        description: 'T-section or half-head highlights for natural-looking contrast. Includes application, processing, rinse, and blow-dry.',
        duration: 150,
        durationNote: '2–2.5 hours total',
        price: 60,
        priceNote: 'from',
        hairLengthSurchargeEligible: true,
      },
      {
        id: 'full-highlights',
        name: 'Full Head Highlights',
        description: 'Comprehensive highlighting throughout for maximum dimension. Includes foils, toner if needed, and blow-dry.',
        duration: 180,
        durationNote: 'approximately 3 hours',
        price: 80,
        priceNote: 'from',
        hairLengthSurchargeEligible: true,
      },
      
      // ==================
      // ADD-ONS (Hair only)
      // ==================
      {
        id: 'deep-conditioning',
        name: 'Deep Conditioning Treatment',
        description: 'Nourishing hair mask with relaxing scalp massage. Add to any hair service for healthier, shinier hair.',
        duration: 15,
        durationNote: 'add-on',
        price: 10,
        isAddOn: true,
        addOnFor: ['hairdressing'],
      },
      
      // ==================
      // CHILDREN'S SERVICES
      // ==================
      {
        id: 'childs-cut',
        name: "Child's Haircut (Under 12)",
        description: "Gentle, patient haircut for girls under 12. Child must be accompanied by an adult who is also having a service.",
        duration: 30,
        price: 18,
        priceNote: 'discounted',
      },
    ],
    note: 'All hairdressing services are for women and girls only. Please have access to running water and good lighting. Colour prices may vary for very long or thick hair (+£10).',
  },
  {
    id: 'companionship',
    title: 'Companionship Visits',
    subtitle: 'Friendly company when you need it',
    description: "Combat loneliness with friendly visits. Whether you'd like someone to chat with over tea, play cards, read aloud, or simply have company during everyday activities – companionship visits bring warmth and connection to your week.",
    icon: 'Heart',
    image: '/images/companionship.jpg',
    color: 'sage',
    includes: [
      'Friendly conversation and company',
      'Tea and chat together',
      'Card games, puzzles, or crafts',
      'Reading aloud or looking through photos',
      'Accompanying on short walks or outings',
      'Help with simple technology (phones, tablets)',
    ],
    excludes: [
      'Personal care (bathing, dressing, toileting)',
      'Medical or nursing tasks',
      'Medication administration',
      'Heavy lifting or physical support',
      'Housekeeping or cleaning',
      'Overnight stays',
    ],
    options: [
      {
        id: 'companion-1hr',
        name: '1 Hour Visit',
        description: 'A friendly check-in and chat to brighten your day.',
        duration: 60,
        price: 20,
        popular: true,
        isTimeBased: true,
        hourlyRate: 20,
        minDurationMinutes: 60,
        incrementMinutes: 30,
      },
      {
        id: 'companion-90min',
        name: '90 Minute Visit',
        description: 'Time for a proper catch-up, activities, and companionship.',
        duration: 90,
        price: 30,
        isTimeBased: true,
        hourlyRate: 20,
        minDurationMinutes: 60,
        incrementMinutes: 30,
      },
      {
        id: 'companion-2hr',
        name: '2 Hour Visit',
        description: 'Extended visit for activities, local outings, or enjoying unhurried company.',
        duration: 120,
        price: 40,
        isTimeBased: true,
        hourlyRate: 20,
        minDurationMinutes: 60,
        incrementMinutes: 30,
      },
      {
        id: 'companion-custom',
        name: 'Custom Duration',
        description: 'Choose your own visit length in 30-minute increments. Minimum 1 hour.',
        duration: 60,
        price: 20,
        priceNote: 'per hour',
        isTimeBased: true,
        hourlyRate: 20,
        minDurationMinutes: 60,
        incrementMinutes: 30,
      },
    ],
    note: 'Companionship visits are strictly non-medical and do not include personal care. Minimum 1-hour booking. Time can be extended in 30-minute increments (£10 per 30 mins).',
  },
  {
    id: 'errands',
    title: 'Errands & Shopping',
    subtitle: 'Helping hands for everyday tasks',
    description: "Let me handle the running around. From grocery shopping and prescription collection to accompanying you to appointments – I'm here to make life a little easier with trustworthy, friendly help.",
    icon: 'ShoppingBag',
    image: '/images/errands.jpg',
    color: 'cream',
    includes: [
      'Grocery shopping (with or for you)',
      'Prescription collection',
      'Post office visits',
      'Dry cleaning pickup/dropoff',
      'Accompanied appointments',
      'Library visits',
    ],
    excludes: [
      'Heavy lifting or furniture moving',
      'House cleaning or tidying',
      'Pet care or dog walking',
      'Childcare or school runs',
      'Driving clients in my vehicle',
    ],
    options: [
      {
        id: 'errands-1hr',
        name: '1 Hour',
        description: 'Time for a small shopping trip or multiple quick errands.',
        duration: 60,
        price: 20,
        popular: true,
        isTimeBased: true,
        hourlyRate: 20,
        minDurationMinutes: 60,
        incrementMinutes: 30,
      },
      {
        id: 'errands-2hr',
        name: '2 Hours',
        description: 'Proper shopping trip, accompanied appointment, or several errands.',
        duration: 120,
        price: 40,
        isTimeBased: true,
        hourlyRate: 20,
        minDurationMinutes: 60,
        incrementMinutes: 30,
      },
      {
        id: 'errands-custom',
        name: 'Custom Duration',
        description: 'Choose your own duration in 30-minute increments. Minimum 1 hour (£20 minimum applies).',
        duration: 60,
        price: 20,
        priceNote: 'per hour',
        isTimeBased: true,
        hourlyRate: 20,
        minDurationMinutes: 60,
        incrementMinutes: 30,
      },
    ],
    note: 'Minimum 1-hour charge (£20) applies. Shopping costs and any transport fares are additional. Receipts always provided.',
  },
];

// Get service by ID
export function getServiceById(id: ServiceCategory | string): Service | undefined {
  return SERVICES.find((service) => service.id === id);
}

// Get all service options across all services
export function getAllServiceOptions(): ServiceOption[] {
  return SERVICES.flatMap((service) => service.options);
}

// Get service option by ID
export function getServiceOptionById(optionId: string): ServiceOption | undefined {
  return getAllServiceOptions().find((option) => option.id === optionId);
}

/**
 * Get available add-ons for a service category
 */
export function getAddOnsForCategory(category: ServiceCategory): ServiceOption[] {
  return getAllServiceOptions().filter(
    (option) => option.isAddOn && option.addOnFor?.includes(category)
  );
}

/**
 * Get services that are eligible for hair length surcharge
 */
export function getHairLengthSurchargeServices(): ServiceOption[] {
  return getAllServiceOptions().filter((option) => option.hairLengthSurchargeEligible);
}

/**
 * Check if a service is time-based
 * Accepts either an option ID string or a ServiceOption object
 */
export function isTimeBasedService(optionOrId: string | ServiceOption): boolean {
  const option = typeof optionOrId === 'string' 
    ? getServiceOptionById(optionOrId) 
    : optionOrId;
  return option?.isTimeBased ?? false;
}

/**
 * Calculate price for time-based service
 * Accepts either an option ID string or a ServiceOption object
 */
export function calculateTimeBasedPrice(optionOrId: string | ServiceOption, durationMinutes: number): number {
  const option = typeof optionOrId === 'string' 
    ? getServiceOptionById(optionOrId) 
    : optionOrId;
  if (!option?.isTimeBased || !option.hourlyRate) {
    return option?.price ?? 0;
  }
  
  // Ensure minimum duration
  const minDuration = option.minDurationMinutes ?? 60;
  const actualDuration = Math.max(durationMinutes, minDuration);
  
  // Calculate price based on hourly rate
  return (actualDuration / 60) * option.hourlyRate;
}

/**
 * Get duration options for time-based services
 * Accepts either an option ID string or a ServiceOption object
 */
export function getTimeBasedDurationOptions(optionOrId: string | ServiceOption): { hours: number; minutes: number; label: string; price: number }[] {
  const option = typeof optionOrId === 'string' 
    ? getServiceOptionById(optionOrId) 
    : optionOrId;
  if (!option?.isTimeBased) return [];
  
  const minDuration = option.minDurationMinutes ?? 60;
  const increment = option.incrementMinutes ?? 30;
  const hourlyRate = option.hourlyRate ?? 20;
  const maxDuration = 180; // 3 hours max
  
  const options: { hours: number; minutes: number; label: string; price: number }[] = [];
  
  for (let mins = minDuration; mins <= maxDuration; mins += increment) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    let label = '';
    if (hours > 0 && remainingMins > 0) {
      label = `${hours} hour${hours > 1 ? 's' : ''} ${remainingMins} mins`;
    } else if (hours > 0) {
      label = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      label = `${mins} minutes`;
    }
    
    const price = (mins / 60) * hourlyRate;
    options.push({ hours: mins / 60, minutes: mins, label, price });
  }
  
  return options;
}
