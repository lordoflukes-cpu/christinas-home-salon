/**
 * Service Packages for Christina's Home Salon
 * 
 * Combination packages and regular booking options for better value.
 * Pricing at £20/hour for companionship/errands.
 */

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number; // For showing savings
  frequency: 'one-time' | 'weekly' | 'fortnightly' | 'monthly';
  duration?: number; // Total duration in minutes
  includes: PackageItem[];
  popular?: boolean;
  bestValue?: boolean;
  note?: string;
}

export interface PackageItem {
  service: string;
  quantity: number;
  description?: string;
}

export const PACKAGES: Package[] = [
  {
    id: 'hair-and-help',
    name: 'Hair & Help Package',
    description: 'Get your hair done while I help with light tasks around the house, or stay for a friendly chat and cuppa after your appointment.',
    price: 50,
    originalPrice: 55,
    frequency: 'one-time',
    duration: 120,
    includes: [
      { service: 'Cut & Blow-Dry', quantity: 1 },
      { service: '1 Hour Companionship or Errands', quantity: 1, description: 'Before or after your hair appointment' },
    ],
    popular: true,
    note: 'Our most popular combination – approximately 2 hours',
  },
  {
    id: 'pamper-morning',
    name: 'Pamper Morning',
    description: 'Treat yourself to colour or highlights plus a friendly companion visit. A relaxing morning of self-care.',
    price: 75,
    originalPrice: 85,
    frequency: 'one-time',
    duration: 180,
    includes: [
      { service: 'Root Colour Touch-Up', quantity: 1 },
      { service: '1 Hour Companionship', quantity: 1, description: 'Chat over tea while colour processes' },
    ],
    bestValue: true,
    note: 'Perfect for making colour appointments less boring – about 3 hours',
  },
  {
    id: 'weekly-companion',
    name: 'Weekly Friendship',
    description: 'Regular weekly companionship visits at a reduced rate. Build a consistent, caring connection.',
    price: 70,
    originalPrice: 80,
    frequency: 'weekly',
    includes: [
      { service: '1 Hour Companionship Visit', quantity: 4, description: '4 visits per month' },
    ],
    note: 'Save £10/month – perfect for regular friendly check-ins',
  },
  {
    id: 'fortnightly-errands',
    name: 'Fortnightly Errands',
    description: 'Regular fortnightly errand runs at a reduced rate. Never miss a prescription or grocery shop.',
    price: 35,
    originalPrice: 40,
    frequency: 'fortnightly',
    includes: [
      { service: '1 Hour Errand Run', quantity: 2, description: '2 visits per month' },
    ],
    note: 'Save £5/month on regular errand support',
  },
  {
    id: 'monthly-maintenance',
    name: 'Monthly Hair Maintenance',
    description: 'Keep your colour fresh and style maintained with this monthly colour touch-up plan.',
    price: 75,
    originalPrice: 80,
    frequency: 'monthly',
    includes: [
      { service: 'Root Colour Touch-Up', quantity: 2, description: '1 appointment every 2 weeks' },
    ],
    note: 'Ideal for keeping grey at bay',
  },
  {
    id: 'complete-care',
    name: 'Complete Care Package',
    description: 'The ultimate monthly package: hair maintenance plus regular companionship and errand support.',
    price: 110,
    originalPrice: 130,
    frequency: 'monthly',
    includes: [
      { service: 'Cut & Blow-Dry', quantity: 1 },
      { service: '2 Hour Companionship', quantity: 2, description: '2 visits per month' },
      { service: '1 Hour Errands', quantity: 1 },
    ],
    bestValue: true,
    note: 'Best value – save £20/month on comprehensive monthly care',
  },
];

// Get package by ID
export function getPackageById(id: string): Package | undefined {
  return PACKAGES.find((pkg) => pkg.id === id);
}

// Calculate savings
export function calculateSavings(pkg: Package): number {
  return pkg.originalPrice - pkg.price;
}

// Format frequency for display
export function formatFrequency(frequency: Package['frequency']): string {
  const map: Record<Package['frequency'], string> = {
    'one-time': 'One-time package',
    weekly: 'Per month (weekly visits)',
    fortnightly: 'Per month (fortnightly visits)',
    monthly: 'Per month',
  };
  return map[frequency];
}
