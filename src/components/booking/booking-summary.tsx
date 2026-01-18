'use client';

import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useBookingStore } from '@/lib/store';
import { getServiceById, getServiceOptionById, isTimeBasedService } from '@/content/services';
import { getPackageById } from '@/content/packages';
import { calculateFullPriceBreakdown, type BookingPriceInput } from '@/lib/pricing/calculator';
import { PRICING_CONFIG } from '@/lib/pricing/config';
import { formatPrice, formatDuration } from '@/lib/utils';

export function BookingSummary() {
  const {
    serviceType,
    selectedOption,
    selectedAddOns,
    timeBasedSelection,
    hairLengthSurcharge,
    additionalClients,
    postcode,
    travelFee,
    isInServiceArea,
    selectedDate,
    selectedTime,
    isSameDay,
    isNewClient,
    setPricingCalculation,
  } = useBookingStore();

  // Get service/package details
  const serviceDetails = useMemo(() => {
    let serviceName = '';
    let optionName = '';
    let price = 0;
    let duration = 0;
    let isColour = false;

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
        
        // Handle time-based services
        if (isTimeBasedService(option) && timeBasedSelection) {
          price = timeBasedSelection.price;
          duration = timeBasedSelection.hours * 60;
        } else {
          price = option.price;
          duration = option.duration;
        }
        
        // Check if this is a colour service (for deposit calculation)
        isColour = PRICING_CONFIG.surcharges.hairLength.appliesTo.includes(option.id);
      }
    }

    return { serviceName, optionName, price, duration, isColour };
  }, [serviceType, selectedOption, timeBasedSelection]);

  // Calculate full price breakdown
  const priceBreakdown = useMemo(() => {
    if (!selectedOption || serviceDetails.price === 0) return null;

    const input: BookingPriceInput = {
      servicePrice: serviceDetails.price,
      serviceName: serviceDetails.optionName,
      serviceDuration: serviceDetails.duration,
      travelFee: isInServiceArea ? travelFee : 0,
      addOns: selectedAddOns,
      hairLengthSurcharge,
      isSameDay,
      additionalClients,
      isNewClient,
      isColourService: serviceDetails.isColour,
    };

    return calculateFullPriceBreakdown(input);
  }, [
    selectedOption,
    serviceDetails,
    travelFee,
    isInServiceArea,
    selectedAddOns,
    hairLengthSurcharge,
    isSameDay,
    additionalClients,
    isNewClient,
  ]);

  // Update store with calculated pricing
  useEffect(() => {
    if (priceBreakdown) {
      setPricingCalculation({
        total: priceBreakdown.total,
        deposit: priceBreakdown.depositAmount,
        depositRequired: priceBreakdown.depositRequired,
      });
    }
  }, [priceBreakdown, setPricingCalculation]);

  // Format date
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : null;

  // Format time
  const formattedTime = selectedTime
    ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-GB', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  const hasAnySelection = serviceType || selectedOption || postcode || selectedDate;

  if (!hasAnySelection) {
    return null;
  }

  // Calculate total duration
  const totalDuration = priceBreakdown?.estimatedDuration || serviceDetails.duration;

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service */}
        {serviceType && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Service
            </p>
            <p className="mt-1 font-medium text-foreground">
              {serviceDetails.serviceName || serviceType}
            </p>
          </div>
        )}

        {/* Option */}
        {selectedOption && serviceDetails.optionName && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Option
            </p>
            <p className="mt-1 font-medium text-foreground">{serviceDetails.optionName}</p>
            {totalDuration > 0 && (
              <p className="text-sm text-muted-foreground">
                {formatDuration(totalDuration)}
              </p>
            )}
          </div>
        )}

        {/* Add-ons */}
        {selectedAddOns.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Add-ons
            </p>
            <div className="mt-1 space-y-1">
              {selectedAddOns.map((addon) => (
                <p key={addon.id} className="text-sm text-foreground">
                  + {addon.name}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Additional clients */}
        {additionalClients.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Additional Guests
            </p>
            <div className="mt-1 space-y-1">
              {additionalClients.map((client, idx) => (
                <p key={idx} className="text-sm text-foreground">
                  + {client.serviceName}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        {postcode && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Location
            </p>
            <p className="mt-1 font-medium text-foreground">{postcode}</p>
            {isInServiceArea && travelFee === 0 && (
              <Badge variant="success" className="mt-1 text-xs">
                No travel fee
              </Badge>
            )}
          </div>
        )}

        {/* Date & Time */}
        {(formattedDate || formattedTime) && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date & Time
            </p>
            <p className="mt-1 font-medium text-foreground">
              {formattedDate}
              {formattedTime && ` at ${formattedTime}`}
            </p>
          </div>
        )}

        {/* Price breakdown */}
        {priceBreakdown && priceBreakdown.items.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              {priceBreakdown.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className={item.amount < 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                    {item.label}
                  </span>
                  <span className={item.amount < 0 ? 'text-green-600 dark:text-green-400' : ''}>
                    {item.amount < 0 ? '-' : ''}{formatPrice(Math.abs(item.amount))}
                  </span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(priceBreakdown.total)}</span>
              </div>

              {/* Savings */}
              {priceBreakdown.savings && priceBreakdown.savings > 0 && (
                <Badge variant="success" className="w-full justify-center">
                  You save {formatPrice(priceBreakdown.savings)}!
                </Badge>
              )}

              {/* Minimum charge notice */}
              {priceBreakdown.minimumChargeApplied && (
                <p className="text-xs text-muted-foreground text-center">
                  Minimum appointment charge of {formatPrice(PRICING_CONFIG.minimumCharge)} applied
                </p>
              )}

              {/* Deposit info */}
              {priceBreakdown.depositRequired && (
                <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-100">
                  <p className="text-sm font-medium">
                    Deposit required: {formatPrice(priceBreakdown.depositAmount)}
                  </p>
                  <p className="text-xs mt-1 text-amber-700 dark:text-amber-300">
                    Due at booking to secure your appointment
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          {priceBreakdown?.depositRequired 
            ? 'Balance due at end of appointment'
            : 'Payment due at end of appointment'}
        </p>
      </CardContent>
    </Card>
  );
}
