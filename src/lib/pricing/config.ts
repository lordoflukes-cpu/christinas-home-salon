/**
 * Pricing Configuration for Christina's Home Salon
 * Service area: Sutton, Surrey and surrounding areas
 * 
 * Travel Fee Tiers:
 * - Core (0-6 miles): FREE - Sutton, Cheam, Belmont, Carshalton, Wallington, Worcester Park
 * - Extended (6-10 miles): £5 - Morden, New Malden, Croydon outskirts, Kingston
 * - Distant (10-15 miles): £12 - Wimbledon, Croydon town centre, Leatherhead
 * - Beyond 15 miles: By special arrangement only (redirect to enquiry)
 * 
 * CONFIGURATION: Edit travel fees, surcharges, and business rules below
 * See docs/CONFIG_GUIDE.md for detailed instructions
 */

export interface TravelTier {
  minMiles: number;
  maxMiles: number;
  fee: number;
  label: string;
  areas?: string; // Example areas for display
}

export interface SurchargeConfig {
  enabled: boolean;
  amount: number;
  label: string;
}

export interface HairLengthSurcharge extends SurchargeConfig {
  appliesTo: string[]; // Service IDs that can have this surcharge
}

export interface SameDaySurcharge extends SurchargeConfig {
  hoursThreshold: number; // Hours before appointment to trigger (e.g., 24)
}

export interface GroupBookingConfig {
  enabled: boolean;
  maxAdditionalClients: number;
  discountPerClient: number; // Amount off per additional client
  appliesTo: string[]; // Service categories eligible for discount
}

export interface DepositConfig {
  enabled: boolean;
  amount: number; // Fixed amount or percentage
  isPercentage: boolean;
  requiredFor: ('new-client' | 'colour' | 'all')[];
}

export interface PricingConfig {
  minimumCharge: number;
  minimumBookingMinutes: number;
  minimumBookingMinutesDistant: number; // For locations 10+ miles
  distantThresholdMiles: number;
  maxServiceRadiusMiles: number;
  travelTiers: TravelTier[];
  
  // Surcharges
  surcharges: {
    hairLength: HairLengthSurcharge;
    sameDay: SameDaySurcharge;
  };
  
  // Group bookings
  groupBooking: GroupBookingConfig;
  
  // Deposit policy
  deposit: DepositConfig;
}

export const PRICING_CONFIG: PricingConfig = {
  // ============================================================
  // CORE PRICING SETTINGS
  // ============================================================
  minimumCharge: 30, // £30 minimum call-out fee applies to all bookings
  minimumBookingMinutes: 60, // 1 hour minimum
  minimumBookingMinutesDistant: 90, // 90 min minimum for distant locations (10+ miles)
  distantThresholdMiles: 10,
  maxServiceRadiusMiles: 15,
  
  // ============================================================
  // TRAVEL FEE TIERS
  // ============================================================
  travelTiers: [
    { 
      minMiles: 0, 
      maxMiles: 6, 
      fee: 0, 
      label: 'Core Area (within 6 miles)',
      areas: 'Sutton, Cheam, Belmont, Carshalton, Wallington, Worcester Park'
    },
    { 
      minMiles: 6, 
      maxMiles: 10, 
      fee: 5, 
      label: 'Extended Area (6-10 miles)',
      areas: 'Morden, New Malden, Croydon outskirts, Kingston'
    },
    { 
      minMiles: 10, 
      maxMiles: 15, 
      fee: 12, 
      label: 'Distant Area (10-15 miles)',
      areas: 'Wimbledon, Croydon town centre, Leatherhead'
    },
  ],
  
  // ============================================================
  // SURCHARGES
  // ============================================================
  surcharges: {
    // Hair length/thickness surcharge for colour services
    hairLength: {
      enabled: true,
      amount: 10, // £10 extra
      label: 'Long/thick hair surcharge',
      appliesTo: ['root-colour', 'full-colour', 'partial-highlights', 'full-highlights'],
    },
    
    // Same-day booking surcharge (optional - disabled by default)
    sameDay: {
      enabled: false, // Set to true to enable
      amount: 10, // £10 extra
      label: 'Same-day booking fee',
      hoursThreshold: 24, // Applies if booking within 24 hours
    },
  },
  
  // ============================================================
  // GROUP BOOKING DISCOUNT
  // ============================================================
  groupBooking: {
    enabled: true,
    maxAdditionalClients: 3, // Up to 3 additional people at same address
    discountPerClient: 5, // £5 off each additional haircut
    appliesTo: ['hairdressing'], // Only applies to hairdressing services
  },
  
  // ============================================================
  // DEPOSIT POLICY
  // ============================================================
  deposit: {
    enabled: true,
    amount: 20, // £20 deposit
    isPercentage: false,
    requiredFor: ['new-client', 'colour'], // Required for new clients or colour services
  },
};

// Postcode prefix to approximate distance mapping
// Based on Sutton, Surrey (SM1) as the service base
// Distances are approximate and used for initial quotes only
export const POSTCODE_DISTANCES: Record<string, number> = {
  // ===============================
  // CORE AREA - FREE TRAVEL (0-6 miles)
  // Sutton, Cheam, Belmont, Carshalton, Wallington, Worcester Park
  // ===============================
  'SM1': 0,  // Sutton (base)
  'SM2': 2,  // Belmont, Cheam Village
  'SM3': 2,  // Cheam, North Cheam
  'SM5': 3,  // Carshalton, Carshalton Beeches
  'SM6': 3,  // Wallington, Beddington
  'SM4': 4,  // Morden (southern parts near Sutton)
  'KT4': 4,  // Worcester Park
  
  // ===============================
  // EXTENDED AREA - £5 TRAVEL (6-10 miles)
  // Morden, New Malden, Croydon outskirts, Kingston areas
  // ===============================
  'SM7': 5,  // Banstead, Tadworth
  'CR5': 6,  // Coulsdon
  'CR8': 6,  // Purley, Kenley
  'KT5': 7,  // Tolworth, Berrylands
  'KT3': 7,  // New Malden
  'KT9': 7,  // Chessington
  'KT17': 7, // Stoneleigh, Ewell
  'KT18': 8, // Epsom, Ashtead
  'KT19': 8, // Ewell, Horton
  'CR0': 8,  // Croydon (outer areas)
  'CR2': 7,  // South Croydon, Sanderstead
  'CR4': 7,  // Mitcham
  
  // ===============================
  // DISTANT AREA - £10-15 TRAVEL (10-15 miles)
  // Wimbledon, Croydon centre, Leatherhead, Kingston centre
  // ===============================
  'SW19': 10, // Wimbledon
  'SW20': 10, // Raynes Park, West Wimbledon
  'SW17': 11, // Tooting
  'CR9': 9,   // Croydon town centre
  'KT1': 10,  // Kingston town centre
  'KT2': 10,  // Kingston, Norbiton
  'KT6': 9,   // Surbiton
  'KT22': 12, // Leatherhead, Fetcham
  'KT21': 12, // Ashtead
  
  // ===============================
  // OUT OF AREA - Special arrangement only (15+ miles)
  // ===============================
  'SW16': 12, // Streatham
  'SE19': 13, // Crystal Palace, Upper Norwood
  'SE20': 13, // Anerley, Penge
  'SE25': 11, // South Norwood
  'RH1': 14,  // Redhill
  'RH2': 15,  // Reigate
  'KT10': 14, // Esher, Claygate
  'KT11': 15, // Cobham
  'KT12': 15, // Walton-on-Thames
  
  // Central London - typically out of area
  'SW1': 20,
  'SW3': 18,
  'SW4': 14,
  'SW7': 18,
  'SW11': 14,
  'SE1': 18,
  'W1': 22,
  'WC1': 22,
  'EC1': 23,
};

export type PostcodeDistances = typeof POSTCODE_DISTANCES;
