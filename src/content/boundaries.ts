/**
 * Service Boundaries for Christina's Home Salon
 * 
 * Clear definition of what IS and IS NOT included in companionship and errand services.
 * These boundaries protect both the client and the service provider while ensuring
 * clarity and managing expectations.
 */

export const SERVICE_BOUNDARIES = {
  // ===================================
  // WHAT WE DO NOT PROVIDE
  // Clearly defined exclusions with explanations
  // ===================================
  excluded: [
    {
      category: 'Personal Care',
      icon: 'ShieldX',
      description: 'I am not a carer and cannot assist with intimate or personal care tasks.',
      items: [
        'Bathing, showering, or washing',
        'Toileting or continence care',
        'Dressing or undressing',
        'Oral/dental hygiene',
        'Feeding or assistance with eating',
        'Personal grooming beyond hairdressing',
      ],
    },
    {
      category: 'Medical & Nursing Tasks',
      icon: 'Stethoscope',
      description: 'I am not medically trained. For health needs, please contact your GP or NHS.',
      items: [
        'Administering any medication (including reminders)',
        'Checking blood pressure, blood sugar, or other vitals',
        'Wound care, bandaging, or dressing changes',
        'Injections or medical device assistance',
        'Moving catheter bags or medical equipment',
        'Any task requiring medical or nursing knowledge',
        'Health monitoring or assessments',
      ],
    },
    {
      category: 'Physical Assistance & Mobility',
      icon: 'Move',
      description: 'For safety reasons, I cannot provide physical support or lifting.',
      items: [
        'Helping someone stand, sit, or transfer',
        'Supporting walking or steadying while mobile',
        'Lifting, hoisting, or moving a person',
        'Assisting with mobility aids',
        'Heavy lifting of any kind (items over 5kg)',
        'Moving furniture or heavy objects',
      ],
    },
    {
      category: 'Housekeeping & Cleaning',
      icon: 'Home',
      description: 'I focus on companionship and errands, not cleaning services.',
      items: [
        'General house cleaning or tidying',
        'Vacuuming, mopping, or dusting',
        'Laundry, ironing, or bed-making',
        'Kitchen deep cleaning or oven cleaning',
        'Bathroom cleaning',
        'Garden maintenance or outdoor work',
      ],
    },
    {
      category: 'Childcare',
      icon: 'Baby',
      description: 'This is an adult-focused service. I do not supervise children.',
      items: [
        'Looking after children of any age alone',
        'School runs or childcare pickups',
        'Babysitting or child supervision',
        'Changing nappies or feeding infants',
      ],
    },
    {
      category: 'Pet Care',
      icon: 'Dog',
      description: 'While I love animals, dedicated pet care is outside my service scope.',
      items: [
        'Dog walking',
        'Pet sitting or overnight pet care',
        'Administering pet medication',
        'Cleaning pet areas or litter trays',
        'Feeding pets (beyond brief assistance during a visit)',
      ],
    },
    {
      category: 'Financial Handling',
      icon: 'Wallet',
      description: 'For your protection and mine, I cannot handle significant finances.',
      items: [
        'Accessing bank accounts',
        'Handling large amounts of cash',
        'Making financial decisions',
        'Signing legal or financial documents',
        'Managing bills or finances',
      ],
      note: 'Small amounts for shopping purposes (with receipts) are acceptable.',
    },
    {
      category: 'Transport in My Vehicle',
      icon: 'Car',
      description: 'I do not provide personal transport services in my vehicle.',
      items: [
        'Driving clients in my personal car',
        'Medical appointment transport',
        'Airport runs or long-distance travel',
        'Regular transport arrangements',
      ],
      note: 'I can accompany you in taxis, on buses, or walking to local appointments.',
    },
    {
      category: 'Extended or Overnight Care',
      icon: 'Moon',
      description: 'My service is for daytime visits only.',
      items: [
        'Overnight stays',
        'Live-in companionship',
        'Sleepover visits',
        '24-hour or continuous care',
        'Visits after 6pm (unless by prior arrangement)',
      ],
    },
  ],

  // ===================================
  // WHAT WE DO PROVIDE
  // Positive, clear descriptions of included services
  // ===================================
  included: {
    companionship: {
      title: 'Companionship Visits',
      description: 'Friendly, genuine company to brighten your week.',
      items: [
        'Friendly conversation and company',
        'Tea, coffee, and chat together',
        'Reading aloud – books, newspapers, letters',
        'Playing cards, board games, or puzzles',
        'Looking through photo albums and reminiscing',
        'Watching TV or films together',
        'Listening and emotional support',
        'Light craft activities',
        'Writing letters or cards together',
        'Help with simple technology (phones, tablets)',
        'Gentle accompanied walks (if you are mobile)',
        'Sitting with you during a tradesperson visit',
      ],
    },
    errands: {
      title: 'Errands & Light Shopping',
      description: 'Helpful hands for everyday tasks you cannot easily do yourself.',
      items: [
        'Grocery shopping (with or for you)',
        'Prescription collection from the pharmacy',
        'Post office visits – posting letters, parcels',
        'Dry cleaning pickup and dropoff',
        'Small household shopping',
        'Library book returns and pickups',
        'Accompanying you to appointments (non-medical)',
        'Waiting for a delivery or tradesperson',
        'Returning items to shops',
        'Picking up essentials like newspapers or toiletries',
      ],
      note: 'Shopping costs and any travel fares are additional – receipts always provided.',
    },
  },

  // ===================================
  // SAFETY & PROFESSIONAL STANDARDS
  // ===================================
  safety: {
    dbs: 'Enhanced DBS checked (certificate available on request)',
    insurance: 'Fully insured for mobile hairdressing and companionship services',
    training: 'Safeguarding awareness trained',
    womenOnly: 'Women-only service for peace of mind',
    references: 'Happy to provide client references',
    identification: 'Will always carry photo ID for your security',
  },

  // ===================================
  // EMERGENCY & REFERRAL GUIDANCE
  // ===================================
  emergency: {
    message: 'If you or someone you are with is experiencing a medical emergency, please call 999 immediately.',
    disclaimer: 'Christina\'s Home Salon provides hairdressing, companionship, and light errands only. These services are NOT a substitute for medical care, professional home care services, social services, or emergency response.',
    referrals: [
      { name: 'NHS 111', description: 'Non-emergency medical advice', phone: '111' },
      { name: 'Age UK', description: 'Support for older people', phone: '0800 678 1602' },
      { name: 'Sutton Council Adult Social Care', description: 'Care assessments', phone: '020 8770 5000' },
      { name: 'Samaritans', description: '24/7 emotional support', phone: '116 123' },
    ],
  },

  // ===================================
  // BOOKING REQUIREMENTS
  // ===================================
  requirements: {
    access: 'Access to running water and good lighting for hairdressing services',
    parking: 'Please ensure parking is available or inform me of restrictions',
    payment: 'Payment due at time of service (cash, bank transfer, or card)',
    cancellation: '24 hours notice required for cancellations',
    id: 'New clients may be asked for proof of address',
  },
} as const;

// ===================================
// WOMEN-ONLY SERVICE MESSAGING
// Consistent language across the website
// ===================================
export const WOMEN_ONLY_STATEMENT = {
  short: 'For women, by a woman',
  tagline: 'A friendly, women-only service in Sutton and Surrey',
  medium: 'Christina\'s Home Salon is a women-only service designed exclusively for female clients who value the comfort and trust of a female service provider.',
  full: 'Christina\'s Home Salon is a women-only business. All hairdressing, companionship, and errand services are provided exclusively to female clients by Christina – a trusted, DBS-checked, experienced professional. Many clients choose a women-only service for comfort, privacy, cultural reasons, or simply personal preference. Whatever your reason, you can feel safe and at ease.',
  booking: 'By booking, you confirm that you identify as a woman and understand this is a women-only service.',
  why: [
    'Comfort and ease in your own home',
    'Privacy and understanding',
    'Cultural or religious preferences',
    'Personal safety and peace of mind',
    'Building a trusted, ongoing relationship',
  ],
};

export type ServiceBoundaries = typeof SERVICE_BOUNDARIES;
export type WomenOnlyStatement = typeof WOMEN_ONLY_STATEMENT;
