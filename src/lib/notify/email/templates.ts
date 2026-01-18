/**
 * Email Templates for Booking and Enquiry
 */

import { formatPrice, formatDuration } from '@/lib/utils';
import { BUSINESS_INFO } from '@/content/business';

export interface BookingEmailData {
  bookingReference: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  serviceDetails: string[];
  date: string;
  time: string;
  address: string;
  postcode: string;
  totalPrice: number;
  depositRequired: boolean;
  depositAmount: number;
  travelFee: number;
  specialRequests?: string;
  estimatedDuration: number;
}

export interface EnquiryEmailData {
  enquiryReference: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  postcode: string;
  address?: string;
  message: string;
  serviceName?: string;
  preferredDate?: string;
  preferredTime?: string;
  reason: 'out-of-area' | 'general' | 'custom-request';
  distanceMiles?: number | null;
}

export function generateBookingConfirmationEmail(data: BookingEmailData): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f472b6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .booking-ref { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; font-size: 18px; font-weight: bold; }
    .details { margin: 20px 0; }
    .detail-row { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-label { font-weight: bold; color: #6b7280; }
    .price-breakdown { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .total { font-size: 20px; font-weight: bold; color: #f472b6; padding-top: 10px; border-top: 2px solid #e5e7eb; }
    .deposit-notice { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Booking Confirmed!</h1>
      <p>Thank you for booking with Christina's Home Salon</p>
    </div>
    
    <div class="content">
      <div class="booking-ref">
        Booking Reference: ${data.bookingReference}
      </div>
      
      <p>Hi ${data.clientName},</p>
      
      <p>Your appointment has been confirmed! I'm looking forward to seeing you.</p>
      
      <div class="details">
        <div class="detail-row">
          <div class="detail-label">Service</div>
          <div>${data.serviceName}</div>
          ${data.serviceDetails.map(detail => `<div style="margin-left: 20px; color: #6b7280;">• ${detail}</div>`).join('')}
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Date & Time</div>
          <div>${data.date} at ${data.time}</div>
          <div style="color: #6b7280; font-size: 14px;">Estimated duration: ${formatDuration(data.estimatedDuration)}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Location</div>
          <div>${data.address}</div>
          <div>${data.postcode}</div>
        </div>
        
        ${data.specialRequests ? `
        <div class="detail-row">
          <div class="detail-label">Special Requests</div>
          <div>${data.specialRequests}</div>
        </div>
        ` : ''}
      </div>
      
      <div class="price-breakdown">
        <h3 style="margin-top: 0;">Price Breakdown</h3>
        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
          <span>Service</span>
          <span>${formatPrice(data.totalPrice - data.travelFee)}</span>
        </div>
        ${data.travelFee > 0 ? `
        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
          <span>Travel fee</span>
          <span>${formatPrice(data.travelFee)}</span>
        </div>
        ` : ''}
        <div class="total" style="display: flex; justify-content: space-between;">
          <span>Total</span>
          <span>${formatPrice(data.totalPrice)}</span>
        </div>
      </div>
      
      ${data.depositRequired ? `
      <div class="deposit-notice">
        <h4 style="margin-top: 0;">💳 Deposit Required</h4>
        <p>A deposit of <strong>${formatPrice(data.depositAmount)}</strong> is required to secure your appointment.</p>
        <p>I'll contact you shortly with payment details. The remaining balance of <strong>${formatPrice(data.totalPrice - data.depositAmount)}</strong> is due at the end of your appointment.</p>
      </div>
      ` : `
      <p><strong>Payment:</strong> Full amount (${formatPrice(data.totalPrice)}) is due at the end of your appointment. I accept cash or bank transfer.</p>
      `}
      
      <h3>What to Expect</h3>
      <ul>
        <li>I'll arrive at your door around ${data.time}</li>
        <li>Please have a clear space ready (kitchen or bathroom works well for hair services)</li>
        <li>I bring all equipment and products</li>
        <li>Feel free to offer a cuppa! ☕</li>
      </ul>
      
      <h3>Need to Make Changes?</h3>
      <p>If you need to reschedule or cancel, please contact me as soon as possible:</p>
      <ul>
        <li>📞 Phone/WhatsApp: ${BUSINESS_INFO.contact.whatsapp}</li>
        <li>📧 Email: ${BUSINESS_INFO.contact.email}</li>
      </ul>
      <p style="font-size: 14px; color: #6b7280;">See our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/cancellation">cancellation policy</a> for details.</p>
      
      <p>Looking forward to seeing you!</p>
      <p><strong>Christina</strong><br>${BUSINESS_INFO.name}</p>
    </div>
    
    <div class="footer">
      <p>${BUSINESS_INFO.name} | ${BUSINESS_INFO.baseArea}</p>
      <p>Women-only mobile hairdressing & companionship services</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}">christinashomesalon.co.uk</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
BOOKING CONFIRMED

Booking Reference: ${data.bookingReference}

Hi ${data.clientName},

Your appointment has been confirmed! I'm looking forward to seeing you.

SERVICE: ${data.serviceName}
${data.serviceDetails.map(d => `• ${d}`).join('\n')}

DATE & TIME: ${data.date} at ${data.time}
Estimated duration: ${formatDuration(data.estimatedDuration)}

LOCATION:
${data.address}
${data.postcode}

${data.specialRequests ? `SPECIAL REQUESTS: ${data.specialRequests}\n` : ''}

PRICE BREAKDOWN:
Service: ${formatPrice(data.totalPrice - data.travelFee)}
${data.travelFee > 0 ? `Travel fee: ${formatPrice(data.travelFee)}\n` : ''}Total: ${formatPrice(data.totalPrice)}

${data.depositRequired ? `
DEPOSIT REQUIRED: ${formatPrice(data.depositAmount)}
I'll contact you shortly with payment details. Remaining balance (${formatPrice(data.totalPrice - data.depositAmount)}) is due at the end of your appointment.
` : `PAYMENT: Full amount (${formatPrice(data.totalPrice)}) is due at the end of your appointment. I accept cash or bank transfer.`}

WHAT TO EXPECT:
- I'll arrive at your door around ${data.time}
- Please have a clear space ready (kitchen or bathroom works well)
- I bring all equipment and products
- Feel free to offer a cuppa! ☕

NEED TO MAKE CHANGES?
Phone/WhatsApp: ${BUSINESS_INFO.contact.whatsapp}
Email: ${BUSINESS_INFO.contact.email}

Looking forward to seeing you!

Christina
${BUSINESS_INFO.name}
${BUSINESS_INFO.baseArea}
christinashomesalon.co.uk
  `;

  return { html, text };
}

export function generateBusinessNotificationEmail(data: BookingEmailData): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
    .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .ref { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 18px; font-weight: bold; text-align: center; }
    .details { border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 20px 0; }
    .row { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #6b7280; margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Booking Received!</h1>
    </div>
    
    <div class="ref">${data.bookingReference}</div>
    
    <div class="details">
      <div class="row">
        <div class="label">Client</div>
        <div>${data.clientName}</div>
        <div style="color: #6b7280;">${data.clientEmail}</div>
        <div style="color: #6b7280;">${data.clientPhone}</div>
      </div>
      
      <div class="row">
        <div class="label">Service</div>
        <div>${data.serviceName}</div>
        ${data.serviceDetails.map(detail => `<div style="margin-left: 15px;">• ${detail}</div>`).join('')}
      </div>
      
      <div class="row">
        <div class="label">Date & Time</div>
        <div>${data.date} at ${data.time}</div>
        <div style="color: #6b7280;">Duration: ${formatDuration(data.estimatedDuration)}</div>
      </div>
      
      <div class="row">
        <div class="label">Location</div>
        <div>${data.address}</div>
        <div>${data.postcode}</div>
      </div>
      
      <div class="row">
        <div class="label">Pricing</div>
        <div>Total: <strong>${formatPrice(data.totalPrice)}</strong></div>
        ${data.travelFee > 0 ? `<div style="color: #6b7280;">Travel fee: ${formatPrice(data.travelFee)}</div>` : ''}
        ${data.depositRequired ? `<div style="color: #f59e0b;">⚠️ Deposit required: ${formatPrice(data.depositAmount)}</div>` : ''}
      </div>
      
      ${data.specialRequests ? `
      <div class="row">
        <div class="label">Special Requests</div>
        <div>${data.specialRequests}</div>
      </div>
      ` : ''}
    </div>
    
    ${data.depositRequired ? `
    <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
      <strong>Action Required:</strong> Contact ${data.clientName} to arrange deposit payment of ${formatPrice(data.depositAmount)}.
    </div>
    ` : ''}
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      This is an automated notification from your booking system.
    </p>
  </div>
</body>
</html>
  `;

  const text = `
NEW BOOKING RECEIVED

Reference: ${data.bookingReference}

CLIENT:
${data.clientName}
${data.clientEmail}
${data.clientPhone}

SERVICE:
${data.serviceName}
${data.serviceDetails.map(d => `• ${d}`).join('\n')}

DATE & TIME:
${data.date} at ${data.time}
Duration: ${formatDuration(data.estimatedDuration)}

LOCATION:
${data.address}
${data.postcode}

PRICING:
Total: ${formatPrice(data.totalPrice)}
${data.travelFee > 0 ? `Travel fee: ${formatPrice(data.travelFee)}\n` : ''}${data.depositRequired ? `⚠️ DEPOSIT REQUIRED: ${formatPrice(data.depositAmount)}\n` : ''}
${data.specialRequests ? `\nSPECIAL REQUESTS:\n${data.specialRequests}\n` : ''}
${data.depositRequired ? `\nACTION REQUIRED: Contact ${data.clientName} to arrange deposit payment.` : ''}
  `;

  return { html, text };
}

export function generateEnquiryEmail(data: EnquiryEmailData): { html: string; text: string } {
  const typeLabel = data.reason === 'out-of-area' ? 'Out of Area' : 
                    data.reason === 'custom-request' ? 'Custom Request' : 'General';
  
  const distanceInfo = data.distanceMiles 
    ? `Distance from base: ~${data.distanceMiles} miles`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
    .header { background: #8b5cf6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .ref { background: #e0e7ff; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 18px; font-weight: bold; text-align: center; }
    .details { border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 20px 0; }
    .row { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #6b7280; margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📩 New Enquiry Received</h1>
      <p>${typeLabel} Enquiry</p>
    </div>
    
    <div class="ref">${data.enquiryReference}</div>
    
    <div class="details">
      <div class="row">
        <div class="label">Client</div>
        <div>${data.clientName}</div>
        <div style="color: #6b7280;">${data.clientEmail}</div>
        <div style="color: #6b7280;">${data.clientPhone}</div>
      </div>
      
      ${data.serviceName ? `
      <div class="row">
        <div class="label">Service of Interest</div>
        <div>${data.serviceName}</div>
      </div>
      ` : ''}
      
      <div class="row">
        <div class="label">Location</div>
        <div>${data.address || ''}</div>
        <div>${data.postcode}</div>
        ${distanceInfo ? `<div style="color: #6b7280; font-size: 14px;">${distanceInfo}</div>` : ''}
      </div>
      
      ${data.preferredDate || data.preferredTime ? `
      <div class="row">
        <div class="label">Preferred Date/Time</div>
        ${data.preferredDate ? `<div>${data.preferredDate}</div>` : ''}
        ${data.preferredTime ? `<div>${data.preferredTime}</div>` : ''}
      </div>
      ` : ''}
      
      <div class="row">
        <div class="label">Message</div>
        <div style="white-space: pre-wrap;">${data.message}</div>
      </div>
    </div>
    
    <div style="background: #e0e7ff; padding: 15px; border-radius: 6px; border-left: 4px solid #8b5cf6;">
      <strong>Action Required:</strong> Reply to ${data.clientName} at ${data.clientEmail} to discuss their enquiry.
    </div>
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      This is an automated notification from your enquiry system.
    </p>
  </div>
</body>
</html>
  `;

  const text = `
NEW ENQUIRY RECEIVED
Type: ${typeLabel}

Reference: ${data.enquiryReference}

CLIENT:
${data.clientName}
${data.clientEmail}
${data.clientPhone}

${data.serviceName ? `SERVICE: ${data.serviceName}\n` : ''}
LOCATION:
${data.address || ''}
${data.postcode}
${distanceInfo}

${data.preferredDate || data.preferredTime ? `PREFERRED DATE/TIME:\n${data.preferredDate || ''} ${data.preferredTime || ''}\n` : ''}
MESSAGE:
${data.message}

ACTION REQUIRED: Reply to ${data.clientName} at ${data.clientEmail}
  `.trim();

  return { html, text };
}
