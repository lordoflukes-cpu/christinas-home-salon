import { z } from 'zod';

// UK postcode regex
const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;

// UK phone regex (various formats)
const phoneRegex = /^(?:(?:\+44)|(?:0))(?:\s?\d){9,10}$/;

export const postcodeSchema = z
  .string()
  .min(1, 'Postcode is required')
  .regex(postcodeRegex, 'Please enter a valid UK postcode');

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(phoneRegex, 'Please enter a valid UK phone number');

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long');

// Step 1: Service selection
export const serviceSelectionSchema = z.object({
  serviceType: z.enum(['hairdressing', 'companion', 'errands', 'packages'], {
    required_error: 'Please select a service type',
  }),
});

// Step 2: Option selection
export const optionSelectionSchema = z.object({
  selectedOption: z.string().min(1, 'Please select a service option'),
});

// Step 3: Location
export const locationSchema = z.object({
  postcode: postcodeSchema,
  address: z.string().min(5, 'Please enter your full address'),
});

// Step 4: Date/Time
export const dateTimeSchema = z.object({
  selectedDate: z.string().min(1, 'Please select a date'),
  selectedTime: z.string().min(1, 'Please select a time'),
});

// Step 5: Client details
export const clientDetailsSchema = z.object({
  clientName: nameSchema,
  clientEmail: emailSchema,
  clientPhone: phoneSchema,
  specialRequests: z.string().max(500, 'Please keep requests under 500 characters').optional(),
  consentBoundaries: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the service boundaries',
  }),
  consentCancellation: z.boolean().refine((val) => val === true, {
    message: 'You must accept the cancellation policy',
  }),
  consentWomenOnly: z.boolean().refine((val) => val === true, {
    message: 'You must confirm this is a women-only service',
  }),
});

// Complete booking schema
export const completeBookingSchema = z.object({
  serviceType: z.enum(['hairdressing', 'companionship', 'errands', 'packages']),
  selectedOption: z.string().min(1),
  postcode: postcodeSchema,
  address: z.string().min(5),
  travelFee: z.number().min(0),
  selectedDate: z.string().min(1),
  selectedTime: z.string().min(1),
  clientName: nameSchema,
  clientEmail: emailSchema,
  clientPhone: phoneSchema,
  specialRequests: z.string().optional(),
  consentBoundaries: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the service boundaries',
  }),
  consentCancellation: z.boolean().refine((val) => val === true, {
    message: 'You must accept the cancellation policy',
  }),
  consentWomenOnly: z.boolean().refine((val) => val === true, {
    message: 'You must confirm this is a women-only service',
  }),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  subject: z.string().min(1, 'Please select a subject').max(100),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
  acceptedPolicy: z.boolean().refine((val) => val === true, {
    message: 'You must accept the privacy policy',
  }),
});

export type ServiceSelectionForm = z.infer<typeof serviceSelectionSchema>;
export type OptionSelectionForm = z.infer<typeof optionSelectionSchema>;
export type LocationForm = z.infer<typeof locationSchema>;
export type DateTimeForm = z.infer<typeof dateTimeSchema>;
export type ClientDetailsForm = z.infer<typeof clientDetailsSchema>;
export type CompleteBooking = z.infer<typeof completeBookingSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
