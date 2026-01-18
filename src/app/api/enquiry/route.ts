import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getEmailProvider } from '@/lib/notify/email';
import { generateEnquiryEmail, type EnquiryEmailData } from '@/lib/notify/email/templates';
import { getTravelTier } from '@/lib/location';
import { BUSINESS_INFO } from '@/content/business';

// Anti-spam: Simple in-memory rate limiting
const recentEnquiries = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_ENQUIRIES_PER_WINDOW = 2;

const enquiryRequestSchema = z.object({
  // Honeypot field - must be empty
  website: z.string().max(0).optional().default(''),
  
  // Service info
  serviceType: z.string().optional(),
  serviceName: z.string().optional(),
  
  // Location
  postcode: z.string().min(1),
  address: z.string().min(1).optional(),
  
  // Client details
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(10),
  message: z.string().min(10),
  
  // Optional date preference
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  
  // Why they're enquiring
  reason: z.enum(['out-of-area', 'general', 'custom-request']).default('general'),
});

type EnquiryRequest = z.infer<typeof enquiryRequestSchema>;

/**
 * Generate enquiry reference
 * Format: ENQ-YYYYMMDD-XXXX
 */
function generateEnquiryReference(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ENQ-${datePart}-${randomPart}`;
}

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const recentCount = recentEnquiries.get(ip) || 0;
  
  // Clean up old entries
  for (const [key, timestamp] of Array.from(recentEnquiries.entries())) {
    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      recentEnquiries.delete(key);
    }
  }
  
  if (recentCount >= MAX_ENQUIRIES_PER_WINDOW) {
    return false;
  }
  
  recentEnquiries.set(ip, recentCount + 1);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many enquiry attempts. Please try again in a few minutes.' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = enquiryRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid enquiry data', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const enquiry = validationResult.data;
    
    // Anti-spam: Check honeypot
    if (enquiry.website && enquiry.website.length > 0) {
      console.log('🚫 Spam detected: honeypot field filled');
      // Return success to avoid revealing anti-spam measures
      return NextResponse.json({ success: true, enquiryReference: 'SPAM-BLOCKED' });
    }
    
    // Generate enquiry reference
    const enquiryReference = generateEnquiryReference();
    
    // Get travel tier info if postcode provided
    const tier = getTravelTier(enquiry.postcode);
    
    // Prepare email data
    const emailData: EnquiryEmailData = {
      enquiryReference,
      clientName: enquiry.clientName,
      clientEmail: enquiry.clientEmail,
      clientPhone: enquiry.clientPhone,
      serviceName: enquiry.serviceName,
      postcode: enquiry.postcode,
      address: enquiry.address,
      message: enquiry.message,
      preferredDate: enquiry.preferredDate,
      preferredTime: enquiry.preferredTime,
      reason: enquiry.reason,
      distanceMiles: tier.distanceMiles,
    };
    
    // Send email
    const emailProvider = getEmailProvider();
    const businessEmail = process.env.EMAIL_TO || BUSINESS_INFO.contact.email;
    const fromEmail = process.env.EMAIL_FROM || `noreply@christinashomesalon.co.uk`;
    
    const enquiryEmail = generateEnquiryEmail(emailData);
    await emailProvider.send({
      from: { email: fromEmail, name: BUSINESS_INFO.name },
      to: { email: businessEmail, name: 'Christina' },
      subject: `📩 New Enquiry: ${enquiryReference}`,
      html: enquiryEmail.html,
      text: enquiryEmail.text,
      replyTo: { email: enquiry.clientEmail, name: enquiry.clientName },
    });
    
    const responseHours = BUSINESS_INFO.responseHours || 24;
    
    return NextResponse.json({
      success: true,
      enquiryReference,
      message: `Thank you! I'll get back to you within ${responseHours} hours.`,
    });
    
  } catch (error) {
    console.error('Enquiry error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process enquiry',
        message: 'Something went wrong. Please try again or contact us directly via WhatsApp.',
      },
      { status: 500 }
    );
  }
}
