'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, Clock, Mail, Phone, ArrowRight, Download, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBookingStore } from '@/lib/store';
import { getServiceById, getServiceOptionById } from '@/content/services';
import { getPackageById } from '@/content/packages';
import { BUSINESS_INFO } from '@/content/business';
import { createBookingICS } from '@/lib/calendar/ics';
import { formatPrice, formatDuration } from '@/lib/utils';

export function BookingConfirmation() {
  const {
    serviceType,
    selectedOption,
    postcode,
    address,
    travelFee,
    selectedDate,
    selectedTime,
    clientName,
    clientEmail,
    clientPhone,
    reset,
    calculatedTotal,
    calculatedDeposit,
    depositRequired,
  } = useBookingStore();

  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [isDownloadingICS, setIsDownloadingICS] = useState(false);

  useEffect(() => {
    // Get booking reference from session storage (set during API submission)
    const ref = sessionStorage.getItem('bookingReference');
    if (ref) {
      setBookingReference(ref);
      // Clean up
      sessionStorage.removeItem('bookingReference');
    }
  }, []);

  // Get service/package details
  let serviceName = '';
  let optionName = '';
  let price = 0;
  let duration = 0;

  if (serviceType === 'packages' && selectedOption) {
    const pkg = getPackageById(selectedOption);
    if (pkg) {
      serviceName = 'Package';
      optionName = pkg.name;
      price = pkg.price;
    }
  } else if (serviceType && selectedOption) {
    const service = getServiceById(serviceType);
    const option = getServiceOptionById(selectedOption);
    if (service && option) {
      serviceName = service.title;
      optionName = option.name;
      price = option.price;
      duration = option.duration;
    }
  }

  const totalPrice = calculatedTotal || (price + (travelFee || 0));

  // Format date for display
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  // Format time for display
  const formattedTime = selectedTime
    ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-GB', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  const handleDownloadICS = async () => {
    if (!bookingReference) return;

    setIsDownloadingICS(true);
    try {
      const icsContent = createBookingICS({
        bookingReference,
        serviceName,
        clientName,
        clientEmail,
        date: selectedDate!,
        time: selectedTime!,
        duration,
        address,
        postcode,
        businessName: BUSINESS_INFO.name,
        businessEmail: BUSINESS_INFO.contact.email,
      });

      // Download ICS
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${bookingReference}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download ICS:', error);
    } finally {
      setIsDownloadingICS(false);
    }
  };

  const handleNewBooking = () => {
    reset();
    window.location.href = '/booking';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-2xl space-y-8"
    >
      {/* Success Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
        >
          <CheckCircle className="h-12 w-12 text-green-600" />
        </motion.div>
        <h1 className="mt-6 text-3xl font-bold text-foreground">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Thank you, {clientName?.split(' ')[0]}! I&apos;ll contact you within {BUSINESS_INFO.responseHours || 24} hours to confirm.
        </p>
      </div>

      {/* Booking Reference */}
      {bookingReference && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Booking Reference</p>
            <p className="mt-2 font-mono text-2xl font-bold text-primary" data-testid="booking-reference">{bookingReference}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Save this reference for your records. You'll need it if you need to reschedule or cancel.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Deposit Notice */}
      {depositRequired && (
        <Card className="border-amber-200 bg-amber-50" data-testid="deposit-notice">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">Deposit Required</p>
                <p className="mt-1 text-sm text-amber-800">
                  A deposit of <strong>{formatPrice(calculatedDeposit || 0)}</strong> is required to secure your booking. 
                  The remainder will be due on the day of your appointment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Booking Summary</h2>
          
          <div className="mt-4 space-y-4">
            {/* Service */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">{serviceName}</p>
                <p className="text-sm text-muted-foreground">{optionName}</p>
                {duration > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Duration: {formatDuration(duration)}
                  </p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {formattedDate}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formattedTime}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">{postcode}</p>
                <p className="text-sm text-muted-foreground">{address}</p>
              </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{optionName}</span>
                <span className="text-foreground">{formatPrice(price)}</span>
              </div>
              {travelFee && travelFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Travel fee</span>
                  <span className="text-foreground">{formatPrice(travelFee)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ICS Download */}
      {bookingReference && (
        <Button
          onClick={handleDownloadICS}
          disabled={isDownloadingICS}
          variant="outline"
          className="w-full"
          data-testid="add-to-calendar"
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloadingICS ? 'Downloading...' : 'Add to Calendar'}
        </Button>
      )}

      {/* What's Next */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900">What happens next?</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              I&apos;ll review your booking request and check availability
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              You&apos;ll receive a confirmation email at <strong>{clientEmail}</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              I may call or text to confirm details or discuss alternatives if needed
            </li>
            {!depositRequired && (
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                Payment is due at the end of your appointment
              </li>
            )}
            {depositRequired && (
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                I&apos;ll send payment details for the deposit to secure your booking
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Contact & Actions */}
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Questions or need to reschedule?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={`tel:${BUSINESS_INFO.contact.phone.replace(/\s/g, '')}`}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Phone className="h-4 w-4" />
            {BUSINESS_INFO.contact.phone}
          </a>
          <a
            href={`https://wa.me/${BUSINESS_INFO.contact.whatsapp?.replace(/\D/g, '')}?text=Hi%20Christina%2C%20I%20have%20a%20booking%20query%3A%20${bookingReference}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            data-testid="whatsapp-link"
          >
            <span>💬</span>
            WhatsApp
          </a>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
          <Button onClick={handleNewBooking}>
            Book Another Appointment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
