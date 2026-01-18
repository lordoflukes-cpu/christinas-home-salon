import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Booking request schema
const bookingRequestSchema = z.object({
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
  
  // Pricing
  total: z.number(),
  depositRequired: z.boolean(),
  depositAmount: z.number(),
  estimatedDuration: z.number(),
});

type BookingRequest = z.infer<typeof bookingRequestSchema>;

/**
 * Send booking confirmation email
 * Uses Resend if configured, otherwise logs to console
 */
async function sendBookingEmail(booking: BookingRequest, bookingRef: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const businessEmail = process.env.BUSINESS_EMAIL || 'christina@example.com';
  const fromEmail = process.env.FROM_EMAIL || 'bookings@christinas-salon.com';
  
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
  let serviceDetails = `${booking.optionName}`;
  if (booking.timeBasedSelection) {
    serviceDetails += ` (${booking.timeBasedSelection.hours} hours)`;
  }
  if (booking.addOns.length > 0) {
    serviceDetails += '\nAdd-ons: ' + booking.addOns.map(a => a.name).join(', ');
  }
  if (booking.additionalClients.length > 0) {
    serviceDetails += '\nAdditional guests: ' + booking.additionalClients.map(c => c.serviceName).join(', ');
  }
  if (booking.hairLengthSurcharge) {
    serviceDetails += '\n+ Long/thick hair surcharge';
  }

  // Email content for Christina
  const businessEmailContent = `
New Booking Request - ${bookingRef}
================================

Client: ${booking.clientName}
Email: ${booking.clientEmail}
Phone: ${booking.clientPhone}
${booking.isNewClient ? '⭐ NEW CLIENT' : 'Returning client'}

📅 Date: ${date}
🕐 Time: ${time}
📍 Location: ${booking.address}, ${booking.postcode}

Service: ${serviceDetails}

Duration: ~${booking.estimatedDuration} minutes
Travel Fee: £${booking.travelFee}
Total: £${booking.total}
${booking.depositRequired ? `Deposit Required: £${booking.depositAmount}` : 'No deposit required'}

${booking.specialRequests ? `Special Requests:\n${booking.specialRequests}` : ''}

Please confirm this booking with the client.
`.trim();

  // Email content for client
  const clientEmailContent = `
Hi ${booking.clientName.split(' ')[0]},

Thank you for your booking request! Here are your details:

📋 Reference: ${bookingRef}
📅 Date: ${date}
🕐 Time: ${time}
💇 Service: ${serviceDetails}

📍 Address: ${booking.address}, ${booking.postcode}

💰 Total: £${booking.total}
${booking.depositRequired ? `
A deposit of £${booking.depositAmount} is required to secure your appointment. I'll be in touch with payment details shortly.
` : ''}

I'll confirm your appointment within 24 hours. If you need to make any changes, please don't hesitate to get in touch.

Looking forward to seeing you!

Warm wishes,
Christina
Christina's Home Salon

---
📞 07XXX XXXXXX
📧 christina@example.com
`.trim();

  // If Resend API key is available, send real emails
  if (resendApiKey) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      // Send to business
      await resend.emails.send({
        from: fromEmail,
        to: businessEmail,
        subject: `New Booking: ${booking.clientName} - ${date} at ${time}`,
        text: businessEmailContent,
      });

      // Send confirmation to client
      await resend.emails.send({
        from: fromEmail,
        to: booking.clientEmail,
        subject: `Booking Request Received - ${bookingRef}`,
        text: clientEmailContent,
      });

      return true;
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return false;
    }
  }

  // Fallback: Log to console (development)
  console.log('\n========== BOOKING EMAIL (Business) ==========');
  console.log('To:', businessEmail);
  console.log('Subject:', `New Booking: ${booking.clientName} - ${date} at ${time}`);
  console.log(businessEmailContent);
  console.log('==============================================\n');

  console.log('\n========== BOOKING EMAIL (Client) ==========');
  console.log('To:', booking.clientEmail);
  console.log('Subject:', `Booking Request Received - ${bookingRef}`);
  console.log(clientEmailContent);
  console.log('============================================\n');

  return true;
}

/**
 * Generate a booking reference
 */
function generateBookingRef(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CHS-${datePart}-${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const parseResult = bookingRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid booking data',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const booking = parseResult.data;
    const bookingRef = generateBookingRef();

    // Send emails
    const emailSent = await sendBookingEmail(booking, bookingRef);

    if (!emailSent) {
      console.warn('Email sending failed, but booking was processed');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      bookingRef,
      message: 'Booking request received successfully',
      emailSent,
    });

  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process booking',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
