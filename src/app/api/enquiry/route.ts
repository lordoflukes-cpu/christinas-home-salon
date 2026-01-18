import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Enquiry request schema
const enquiryRequestSchema = z.object({
  // Contact details
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  
  // Enquiry details
  enquiryType: z.enum(['out-of-area', 'service-question', 'pricing', 'availability', 'other']),
  message: z.string().min(10, 'Please provide more detail'),
  
  // Location (for out-of-area enquiries)
  postcode: z.string().optional(),
  
  // Optional service context
  serviceInterest: z.string().optional(),
  
  // Consent
  consentContact: z.boolean().refine(val => val === true, {
    message: 'You must consent to being contacted',
  }),
});

type EnquiryRequest = z.infer<typeof enquiryRequestSchema>;

/**
 * Send enquiry notification email
 */
async function sendEnquiryEmail(enquiry: EnquiryRequest, enquiryRef: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const businessEmail = process.env.BUSINESS_EMAIL || 'christina@example.com';
  const fromEmail = process.env.FROM_EMAIL || 'enquiries@christinas-salon.com';
  
  const enquiryTypeLabels: Record<string, string> = {
    'out-of-area': '📍 Out of Service Area',
    'service-question': '❓ Service Question',
    'pricing': '💰 Pricing Enquiry',
    'availability': '📅 Availability Check',
    'other': '📝 General Enquiry',
  };

  // Email content for Christina
  const businessEmailContent = `
New Enquiry - ${enquiryRef}
===========================

Type: ${enquiryTypeLabels[enquiry.enquiryType]}

From: ${enquiry.name}
Email: ${enquiry.email}
${enquiry.phone ? `Phone: ${enquiry.phone}` : ''}
${enquiry.postcode ? `Postcode: ${enquiry.postcode}` : ''}
${enquiry.serviceInterest ? `Interested in: ${enquiry.serviceInterest}` : ''}

Message:
${enquiry.message}

---
Reply directly to this email or contact the client at ${enquiry.email}
`.trim();

  // Auto-reply for client
  const clientEmailContent = `
Hi ${enquiry.name.split(' ')[0]},

Thank you for getting in touch! I've received your enquiry and will get back to you as soon as possible, usually within 24 hours.

📋 Reference: ${enquiryRef}

Your message:
"${enquiry.message}"

If your enquiry is urgent, please feel free to call me.

Warm wishes,
Christina
Christina's Home Salon

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
        replyTo: enquiry.email,
        subject: `[${enquiry.enquiryType.toUpperCase()}] Enquiry from ${enquiry.name}`,
        text: businessEmailContent,
      });

      // Send auto-reply to client
      await resend.emails.send({
        from: fromEmail,
        to: enquiry.email,
        subject: `Thanks for your enquiry - ${enquiryRef}`,
        text: clientEmailContent,
      });

      return true;
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return false;
    }
  }

  // Fallback: Log to console (development)
  console.log('\n========== ENQUIRY EMAIL (Business) ==========');
  console.log('To:', businessEmail);
  console.log('Reply-To:', enquiry.email);
  console.log('Subject:', `[${enquiry.enquiryType.toUpperCase()}] Enquiry from ${enquiry.name}`);
  console.log(businessEmailContent);
  console.log('==============================================\n');

  console.log('\n========== ENQUIRY EMAIL (Client) ==========');
  console.log('To:', enquiry.email);
  console.log('Subject:', `Thanks for your enquiry - ${enquiryRef}`);
  console.log(clientEmailContent);
  console.log('============================================\n');

  return true;
}

/**
 * Generate an enquiry reference
 */
function generateEnquiryRef(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ENQ-${datePart}-${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const parseResult = enquiryRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid enquiry data',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const enquiry = parseResult.data;
    const enquiryRef = generateEnquiryRef();

    // Send emails
    const emailSent = await sendEnquiryEmail(enquiry, enquiryRef);

    if (!emailSent) {
      console.warn('Email sending failed, but enquiry was processed');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      enquiryRef,
      message: 'Enquiry received successfully',
      emailSent,
    });

  } catch (error) {
    console.error('Enquiry API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process enquiry',
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
