'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, User, Mail, Phone, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBookingStore } from '@/lib/store';
import { clientDetailsSchema, type ClientDetailsForm } from '@/lib/schema';

interface Step5DetailsProps {
  onComplete: () => void;
}

export function Step5Details({ onComplete }: Step5DetailsProps) {
  const {
    clientName,
    clientEmail,
    clientPhone,
    specialRequests,
    consentBoundaries,
    consentCancellation,
    consentWomenOnly,
    setClientDetails,
    prevStep,
  } = useBookingStore();
  
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientDetailsForm>({
    resolver: zodResolver(clientDetailsSchema),
    defaultValues: {
      clientName: clientName || '',
      clientEmail: clientEmail || '',
      clientPhone: clientPhone || '',
      specialRequests: specialRequests || '',
      consentBoundaries: consentBoundaries || false,
      consentCancellation: consentCancellation || false,
      consentWomenOnly: consentWomenOnly || false,
    },
  });

  const watchedConsents = watch(['consentBoundaries', 'consentCancellation', 'consentWomenOnly']);

  const onSubmit = async (data: ClientDetailsForm) => {
    setSubmitting(true);
    
    // Save to store
    setClientDetails({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      specialRequests: data.specialRequests || '',
      consentBoundaries: data.consentBoundaries,
      consentCancellation: data.consentCancellation,
      consentWomenOnly: data.consentWomenOnly,
    });

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setSubmitting(false);
    onComplete();
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
            Your Details
          </h2>
          <p className="text-muted-foreground">
            Almost there! Just a few more details to complete your booking
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </span>
              </Label>
              <Input
                id="clientName"
                placeholder="Your full name"
                {...register('clientName')}
              />
              {errors.clientName && (
                <p className="text-sm text-destructive">
                  {errors.clientName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </span>
              </Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="your.email@example.com"
                {...register('clientEmail')}
              />
              {errors.clientEmail && (
                <p className="text-sm text-destructive">
                  {errors.clientEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </span>
              </Label>
              <Input
                id="clientPhone"
                type="tel"
                placeholder="07XXX XXXXXX"
                {...register('clientPhone')}
              />
              {errors.clientPhone && (
                <p className="text-sm text-destructive">
                  {errors.clientPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Special Requests or Notes (Optional)
                </span>
              </Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requirements, accessibility needs, or things I should know..."
                rows={3}
                {...register('specialRequests')}
              />
              {errors.specialRequests && (
                <p className="text-sm text-destructive">
                  {errors.specialRequests.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consent Checkboxes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Terms & Consent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Women Only Consent */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentWomenOnly"
                checked={watch('consentWomenOnly')}
                onCheckedChange={(checked) =>
                  setValue('consentWomenOnly', checked as boolean, { shouldValidate: true })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="consentWomenOnly"
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  I confirm I am a woman and understand this is a women-only service
                </label>
                <p className="text-xs text-muted-foreground">
                  All services are provided exclusively to female clients.
                </p>
              </div>
            </div>
            {errors.consentWomenOnly && (
              <p className="text-sm text-destructive">
                {errors.consentWomenOnly.message}
              </p>
            )}

            {/* Service Boundaries Consent */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentBoundaries"
                checked={watch('consentBoundaries')}
                onCheckedChange={(checked) =>
                  setValue('consentBoundaries', checked as boolean, { shouldValidate: true })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="consentBoundaries"
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  I understand and accept the service boundaries
                </label>
                <p className="text-xs text-muted-foreground">
                  No medical care, personal care, cleaning, childcare, overnight stays, or heavy lifting.{' '}
                  <Link href="/safety" className="text-primary hover:underline">
                    View full details
                  </Link>
                </p>
              </div>
            </div>
            {errors.consentBoundaries && (
              <p className="text-sm text-destructive">
                {errors.consentBoundaries.message}
              </p>
            )}

            {/* Cancellation Policy Consent */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentCancellation"
                checked={watch('consentCancellation')}
                onCheckedChange={(checked) =>
                  setValue('consentCancellation', checked as boolean, { shouldValidate: true })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="consentCancellation"
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  I accept the cancellation policy
                </label>
                <p className="text-xs text-muted-foreground">
                  24 hours notice required. Late cancellations may incur a 50% charge.{' '}
                  <Link href="/cancellation" className="text-primary hover:underline">
                    View full policy
                  </Link>
                </p>
              </div>
            </div>
            {errors.consentCancellation && (
              <p className="text-sm text-destructive">
                {errors.consentCancellation.message}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="min-w-[200px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Complete Booking'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
