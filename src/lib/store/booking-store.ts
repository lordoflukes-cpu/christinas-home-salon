import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ServiceCategory, ServiceOption } from '@/content/services';
import type { Package } from '@/content/packages';

export type BookingStep = 1 | 2 | 3 | 4 | 5;

/** Add-on selection with price and duration */
export interface SelectedAddOn {
  id: string;
  name: string;
  price: number;
  duration: number;
}

/** Additional client for group bookings */
export interface AdditionalClient {
  serviceName: string;
  serviceId: string;
  price: number;
  duration: number;
}

/** Time-based service duration selection */
export interface TimeBasedSelection {
  hours: number;
  price: number;
}

export interface BookingState {
  // Current step
  step: BookingStep;
  
  // Step 1: Service selection
  serviceType: ServiceCategory | 'packages' | null;
  
  // Step 2: Options selection
  selectedOption: string | null; // Service option ID or package ID
  selectedAddOns: SelectedAddOn[];
  timeBasedSelection: TimeBasedSelection | null; // For companionship/errands
  hairLengthSurcharge: boolean; // Long/thick hair surcharge
  additionalClients: AdditionalClient[]; // Group booking
  
  // Step 3: Location
  postcode: string;
  address: string;
  travelFee: number;
  isInServiceArea: boolean | null;
  requiresEnquiry: boolean; // Out of area but may consider
  
  // Step 4: Date/Time
  selectedDate: string | null;
  selectedTime: string | null;
  isSameDay: boolean;
  
  // Step 5: Client details
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  specialRequests: string;
  isNewClient: boolean;
  consentBoundaries: boolean;
  consentCancellation: boolean;
  consentWomenOnly: boolean;
  
  // Calculated pricing (kept in sync)
  calculatedTotal: number;
  calculatedDeposit: number;
  depositRequired: boolean;
  
  // Actions
  setStep: (step: BookingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setServiceType: (type: ServiceCategory | 'packages' | null) => void;
  setSelectedOption: (optionId: string | null) => void;
  setAddOns: (addOns: SelectedAddOn[]) => void;
  addAddOn: (addOn: SelectedAddOn) => void;
  removeAddOn: (addOnId: string) => void;
  setTimeBasedSelection: (selection: TimeBasedSelection | null) => void;
  setHairLengthSurcharge: (applies: boolean) => void;
  setAdditionalClients: (clients: AdditionalClient[]) => void;
  addAdditionalClient: (client: AdditionalClient) => void;
  removeAdditionalClient: (index: number) => void;
  setLocation: (data: { 
    postcode: string; 
    address: string; 
    travelFee: number; 
    isInServiceArea: boolean;
    requiresEnquiry?: boolean;
  }) => void;
  setDateTime: (date: string, time: string) => void;
  setClientDetails: (details: Partial<Pick<BookingState, 
    'clientName' | 'clientEmail' | 'clientPhone' | 'specialRequests' | 
    'isNewClient' | 'consentBoundaries' | 'consentCancellation' | 'consentWomenOnly'
  >>) => void;
  setPricingCalculation: (data: { total: number; deposit: number; depositRequired: boolean }) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as BookingStep,
  serviceType: null,
  selectedOption: null,
  selectedAddOns: [] as SelectedAddOn[],
  timeBasedSelection: null as TimeBasedSelection | null,
  hairLengthSurcharge: false,
  additionalClients: [] as AdditionalClient[],
  postcode: '',
  address: '',
  travelFee: 0,
  isInServiceArea: null,
  requiresEnquiry: false,
  selectedDate: null,
  selectedTime: null,
  isSameDay: false,
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  specialRequests: '',
  isNewClient: true,
  consentBoundaries: false,
  consentCancellation: false,
  consentWomenOnly: false,
  calculatedTotal: 0,
  calculatedDeposit: 0,
  depositRequired: false,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      nextStep: () => {
        const currentStep = get().step;
        if (currentStep < 5) {
          set({ step: (currentStep + 1) as BookingStep });
        }
      },

      prevStep: () => {
        const currentStep = get().step;
        if (currentStep > 1) {
          set({ step: (currentStep - 1) as BookingStep });
        }
      },

      setServiceType: (type) => set({ 
        serviceType: type, 
        selectedOption: null,
        selectedAddOns: [],
        timeBasedSelection: null,
        hairLengthSurcharge: false,
        additionalClients: [],
      }),

      setSelectedOption: (optionId) => set({ 
        selectedOption: optionId,
        selectedAddOns: [],
        timeBasedSelection: null,
        hairLengthSurcharge: false,
      }),

      setAddOns: (addOns) => set({ selectedAddOns: addOns }),

      addAddOn: (addOn) => set((state) => ({
        selectedAddOns: [...state.selectedAddOns, addOn],
      })),

      removeAddOn: (addOnId) => set((state) => ({
        selectedAddOns: state.selectedAddOns.filter((a) => a.id !== addOnId),
      })),

      setTimeBasedSelection: (selection) => set({ timeBasedSelection: selection }),

      setHairLengthSurcharge: (applies) => set({ hairLengthSurcharge: applies }),

      setAdditionalClients: (clients) => set({ additionalClients: clients }),

      addAdditionalClient: (client) => set((state) => ({
        additionalClients: [...state.additionalClients, client],
      })),

      removeAdditionalClient: (index) => set((state) => ({
        additionalClients: state.additionalClients.filter((_, i) => i !== index),
      })),

      setLocation: ({ postcode, address, travelFee, isInServiceArea, requiresEnquiry = false }) =>
        set({ postcode, address, travelFee, isInServiceArea, requiresEnquiry }),

      setDateTime: (date, time) => {
        // Check if this is a same-day booking
        const today = new Date().toISOString().split('T')[0];
        const isSameDay = date === today;
        set({ selectedDate: date, selectedTime: time, isSameDay });
      },

      setClientDetails: (details) => set(details),

      setPricingCalculation: ({ total, deposit, depositRequired }) => 
        set({ calculatedTotal: total, calculatedDeposit: deposit, depositRequired }),

      reset: () => set(initialState),
    }),
    {
      name: 'booking-storage',
      partialize: (state) => ({
        // Only persist these fields for session continuity
        step: state.step,
        serviceType: state.serviceType,
        selectedOption: state.selectedOption,
        selectedAddOns: state.selectedAddOns,
        timeBasedSelection: state.timeBasedSelection,
        hairLengthSurcharge: state.hairLengthSurcharge,
        additionalClients: state.additionalClients,
        postcode: state.postcode,
        address: state.address,
        travelFee: state.travelFee,
        isInServiceArea: state.isInServiceArea,
        requiresEnquiry: state.requiresEnquiry,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
        isSameDay: state.isSameDay,
      }),
    }
  )
);
