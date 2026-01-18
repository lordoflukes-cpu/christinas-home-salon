'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MapPin, Check, X, Loader2, AlertCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useBookingStore } from '@/lib/store';
import { locationSchema, type LocationForm } from '@/lib/schema';
import { checkServiceArea, formatPostcode } from '@/lib/pricing';
import { formatPrice } from '@/lib/utils';
import { BUSINESS_INFO } from '@/content/business';

export function Step3Location() {
  const { postcode, address, travelFee, isInServiceArea, requiresEnquiry, setLocation, nextStep, prevStep } = useBookingStore();
  const [checking, setChecking] = useState(false);
  const [areaResult, setAreaResult] = useState<ReturnType<typeof checkServiceArea> | null>(
    isInServiceArea !== null
      ? {
          isInArea: isInServiceArea,
          requiresEnquiry,
          distanceMiles: null,
          travelFee,
          travelTier: null,
          minimumBookingMinutes: 60,
          message: isInServiceArea ? 'You\'re in the service area.' : 'Outside service area.',
        }
      : null
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      postcode: postcode || '',
      address: address || '',
    },
  });

  const watchedPostcode = watch('postcode');

  const handleCheckPostcode = async () => {
    const pc = watchedPostcode?.trim();
    if (!pc) return;

    setChecking(true);
    // Simulate delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const result = checkServiceArea(pc);
    setAreaResult(result);
    setValue('postcode', formatPostcode(pc));
    setChecking(false);
  };

  const onSubmit = (data: LocationForm) => {
    if (!areaResult?.isInArea) return;

    setLocation({
      postcode: data.postcode,
      address: data.address,
      travelFee: areaResult.travelFee,
      isInServiceArea: true,
      requiresEnquiry: false,
    });
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={prevStep}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Where should I visit?
          </h2>
          <p className="text-muted-foreground">
            Enter your address to check the service area and travel fee
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Postcode Check */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">Check Your Area</span>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="postcode" className="sr-only">
                    Postcode
                  </Label>
                  <Input
                    id="postcode"
                    placeholder="Enter your postcode (e.g., SM1 1AA)"
                    className="uppercase"
                    {...register('postcode')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCheckPostcode();
                      }
                    }}
                  />
                  {errors.postcode && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.postcode.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCheckPostcode}
                  disabled={checking || !watchedPostcode?.trim()}
                >
                  {checking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Check'
                  )}
                </Button>
              </div>

              {/* Result */}
              {areaResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg p-4 ${
                    areaResult.isInArea
                      ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
                      : areaResult.requiresEnquiry
                      ? 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100'
                      : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {areaResult.isInArea ? (
                      <Check className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : areaResult.requiresEnquiry ? (
                      <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <X className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <div>
                      <p className="font-medium">{areaResult.message}</p>
                      {areaResult.isInArea && (
                        <p className="mt-1 text-sm">
                          Travel fee:{' '}
                          <span className="font-medium">
                            {areaResult.travelFee > 0
                              ? formatPrice(areaResult.travelFee)
                              : 'Free! 🎉'}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address - only show if postcode is in area */}
        {areaResult?.isInArea && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full address including house number and street"
                    rows={3}
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Please include your house number or name so I can find you easily.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enquiry prompt for borderline areas */}
        {areaResult && !areaResult.isInArea && areaResult.requiresEnquiry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        I may still be able to help!
                      </p>
                      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                        Your area is a bit further than my usual service radius, but I'm happy to discuss options. 
                        Get in touch and we can work something out.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={`mailto:${BUSINESS_INFO.contact.email}?subject=Booking Enquiry - ${watchedPostcode}&body=Hi Christina,%0A%0AI'd like to enquire about booking a service. My postcode is ${watchedPostcode}.%0A%0AThank you!`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Send Email
                    </a>
                    <a
                      href={`tel:${BUSINESS_INFO.contact.phone.replace(/\s/g, '')}`}
                      className="flex items-center justify-center gap-2 rounded-lg border border-primary bg-background px-4 py-3 font-medium text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Call Me
                    </a>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    I usually respond within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Completely out of area message */}
        {areaResult && !areaResult.isInArea && !areaResult.requiresEnquiry && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <X className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
                <div className="text-sm text-red-900 dark:text-red-100">
                  <p className="font-medium">Outside my service area</p>
                  <p className="mt-1">
                    Unfortunately I can&apos;t travel to your area. I recommend searching for 
                    a mobile hairdresser closer to your location.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!areaResult?.isInArea}
            size="lg"
          >
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
