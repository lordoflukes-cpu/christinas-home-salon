import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getEmailProvider } from '@/lib/notify/email';
import { generateBookingConfirmationEmail, generateBusinessNotificationEmail, type BookingEmailData } from '@/lib/notify/email/templates';
import { calculateFullPriceBreakdown, type BookingPriceInput } from '@/lib/pricing/calculator';
import { getTravelTier, isServiceable } from '@/lib/location';
import { checkRateLimit } from '@/lib/rate-limit';
import { getServiceOptionById } from '@/content/services';
import { getPackageById } from '@/content/packages';
import { BUSINESS_INFO } from '@/content/business';

// Booking request schema with anti-spam honeypot
const bookingRequestSchema = z.object({
  // Honeypot field - must be empty
  website: z.string().max(0).optional().default(''),
  
  // Service info
  serviceType: z.string(),
  selectedOption: z.string(),
  serviceName: z.string(),
  optionName: z.string(),
  
  // Add-ons and extras
  addOns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    duration: z.number(),
  })).optional().default([]),
  hairLengthSurcharge: z.boolean().optional().default(false),
  additionalClients: z.array(z.object({
    serviceId: z.string(),
    serviceName: z.string(),
    price: z.number(),
    duration: z.number(),
  })).optional().default([]),
  
  // Time-based service
  timeBasedSelection: z.object({
    hours: z.number(),
    price: z.number(),
  }).nullable().optional(),
  
  // Location
  postcode: z.string().min(1),
  address: z.string().min(1),
  travelFee: z.number(),
  
  // Date/Time
  selectedDate: z.string(),
  selectedTime: z.string(),
  isSameDay: z.boolean().optional().default(false),
  
  // Client details
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(10),
  specialRequests: z.string().optional().default(''),
  isNewClient: z.boolean().optional().default(true),
  
  // Consents
  consentBoundaries: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge the service boundaries',
  }),
  consentCancellation: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge the cancellation policy',
  }),
  consentWomenOnly: z.boolean().refine(val => val === true, {
    message: 'You must confirm this is a women-only service',
  }),
  
  // Client-submitted pricing (will be recalculated server-side)
  total: z.number(),
  depositRequired: z.boolean(),
  depositAmount: z.number(),
  estimatedDuration: z.number(),
  
  // Flag if this is a colour service
  isColourService: z.boolean().optional().default(false),
});

type BookingRequest = z.infer<typeof bookingRequestSchema>;

/**
 * Generate booking reference
 * Format: CHS-YYYYMMDD-XXXX
 */
function generateBookingReference(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CHS-${datePart}-${randomPart}`;
}

/**
 * Calculate deposit amount based on policy
 */
function calculateDeposit(
  total: number,
  isNewClient: boolean,
  isColourService: boolean
): { required: boolean; amount: number } {
  const { depositPolicy } = BUSINESS_INFO;
  
  if (!depositPolicy.enabled) {
    return { required: false, amount: 0 };
  }
  
  let required = false;
  
  switch (depositPolicy.trigger) {
    case 'ALL':
      required = true;
      break;
    case 'NEW_CLIENT':
      required = isNewClient;
      break;
    case 'COLOUR':
      required = isColourService;
      break;
    case 'NEW_CLIENT_OR_COLOUR':
      required = isNewClient || isColourService;
      break;
  }
  
  if (!required) {
    return { required: false, amount: 0 };
  }
  
  const amount = depositPolicy.depositType === 'FIXED'
    ? depositPolicy.amount
    : Math.round((total * depositPolicy.amount) / 100);
  
  return { required: true, amount };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many booking attempts. Please try again in a few minutes.' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = bookingRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const booking = validationResult.data;
    
    // Anti-spam: Check honeypot
    if (booking.website && booking.website.length > 0) {
      console.log('🚫 Spam detected: honeypot field filled');
      // Return success to avoid revealing anti-spam measures
      return NextResponse.json({ success: true, bookingReference: 'SPAM-BLOCKED' });
    }
    
    // Verify service area
    const tier = getTravelTier(booking.postcode);
    if (!isServiceable(booking.postcode)) {
      return NextResponse.json(
        { 
          error: 'Service area check failed',
          message: 'This postcode is outside our service area. Please submit an enquiry instead.',
          enquiryOnly: true,
        },
        { status: 400 }
      );
    }
    
    // Get actual service price from catalog (don't trust client!)
    let actualServicePrice = 0;
    if (booking.serviceType === 'packages') {
      const pkg = getPackageById(booking.selectedOption);
      actualServicePrice = pkg?.price || 0;
    } else {
      const option = getServiceOptionById(booking.selectedOption);
      actualServicePrice = option?.price || 0;
      
      // Handle time-based services - calculate price from hourly rate
      if (booking.timeBasedSelection && option?.isTimeBased && option.hourlyRate) {
        actualServicePrice = option.hourlyRate * booking.timeBasedSelection.hours;
      }
    }
    
    // Server-side price recalculation (never trust client totals!)
    const priceInput: BookingPriceInput = {
      servicePrice: actualServicePrice, // Use server-determined price
      serviceName: booking.optionName,
      serviceDuration: booking.estimatedDuration,
      travelFee: tier.fee, // Use server-calculated travel fee
      addOns: booking.addOns,
      hairLengthSurcharge: booking.hairLengthSurcharge,
      isSameDay: booking.isSameDay,
      additionalClients: booking.additionalClients,
      isNewClient: booking.isNewClient,
      isColourService: booking.isColourService,
    };
    
    const priceBreakdown = calculateFullPriceBreakdown(priceInput);
    const depositInfo = calculateDeposit(priceBreakdown.total, booking.isNewClient, booking.isColourService);
    
    // Generate booking reference
    const bookingReference = generateBookingReference();
    
    // Format date and time
    const date = new Date(booking.selectedDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const time = new Date(`2000-01-01T${booking.selectedTime}`).toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    // Build service details
    const serviceDetails: string[] = [];
    if (booking.timeBasedSelection) {
      serviceDetails.push(`Duration: ${booking.timeBasedSelection.hours} hours`);
    }
    if (booking.addOns.length > 0) {
      serviceDetails.push(...booking.addOns.map(a => `Add-on: ${a.name}`));
    }
    if (booking.additionalClients.length > 0) {
      serviceDetails.push(...booking.additionalClients.map(c => `Additional: ${c.serviceName}`));
    }
    if (booking.hairLengthSurcharge) {
      serviceDetails.push('Long/thick hair surcharge');
    }
    
    // Prepare email data
    const emailData: BookingEmailData = {
      bookingReference,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      serviceName: booking.serviceName + (booking.optionName ? ` - ${booking.optionName}` : ''),
      serviceDetails,
      date,
      time: booking.selectedTime,
      address: booking.address,
      postcode: booking.postcode,
      totalPrice: priceBreakdown.total,
      depositRequired: depositInfo.required,
      depositAmount: depositInfo.amount,
      travelFee: tier.fee,
      specialRequests: booking.specialRequests,
      estimatedDuration: priceBreakdown.estimatedDuration,
    };
    
    // Send emails
    const emailProvider = getEmailProvider();
    const businessEmail = process.env.EMAIL_TO || BUSINESS_INFO.contact.email;
    const fromEmail = process.env.EMAIL_FROM || `noreply@christinashomesalon.co.uk`;
    
    // Send business notification
    const businessNotification = generateBusinessNotificationEmail(emailData);
    await emailProvider.send({
      from: { email: fromEmail, name: BUSINESS_INFO.name },
      to: { email: businessEmail, name: 'Christina' },
      subject: `🎉 New Booking: ${bookingReference}`,
      html: businessNotification.html,
      text: businessNotification.text,
      replyTo: { email: booking.clientEmail, name: booking.clientName },
    });
    
    // Send customer confirmation (if enabled)
    const customerEmailEnabled = process.env.CUSTOMER_EMAIL_ENABLED === 'true';
    if (customerEmailEnabled) {
      const customerConfirmation = generateBookingConfirmationEmail(emailData);
      await emailProvider.send({
        from: { email: fromEmail, name: BUSINESS_INFO.name },
        to: { email: booking.clientEmail, name: booking.clientName },
        subject: `Booking Confirmed: ${bookingReference}`,
        html: customerConfirmation.html,
        text: customerConfirmation.text,
        replyTo: { email: businessEmail, name: 'Christina' },
      });
    }
    
    return NextResponse.json({
      success: true,
      bookingReference,
      depositRequired: depositInfo.required,
      depositAmount: depositInfo.amount,
      total: priceBreakdown.total,
      message: depositInfo.required
        ? 'Booking received! I\'ll contact you shortly to arrange the deposit payment.'
        : 'Booking confirmed! I\'ll see you soon.',
    });
    
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process booking',
        message: 'Something went wrong. Please try again or contact us directly.',
      },
      { status: 500 }
    );
  }
}
