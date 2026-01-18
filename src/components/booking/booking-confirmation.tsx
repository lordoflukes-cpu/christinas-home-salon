'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, Clock, Mail, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBookingStore } from '@/lib/store';
import { getServiceById, getServiceOptionById } from '@/content/services';
import { getPackageById } from '@/content/packages';
import { BUSINESS_INFO } from '@/content/business';
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
  } = useBookingStore();

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

  const totalPrice = price + travelFee;

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

  const handleNewBooking = () => {
    reset();
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
          Booking Request Received!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Thank you, {clientName?.split(' ')[0]}! I&apos;ll confirm your appointment within 24 hours.
        </p>
      </div>

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
              {travelFee > 0 && (
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
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              Payment is due at the end of your appointment
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Email Placeholder Note */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="text-sm text-amber-900">
              <p className="font-medium">Email confirmation coming soon</p>
              <p className="mt-1">
                Automated email confirmations will be set up shortly. For now,
                I&apos;ll confirm your booking manually within 24 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Actions */}
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Questions? Get in touch:
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
            href={`mailto:${BUSINESS_INFO.contact.email}`}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            {BUSINESS_INFO.contact.email}
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
