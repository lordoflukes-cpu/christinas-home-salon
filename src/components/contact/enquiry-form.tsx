'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, User, Mail, Phone, MessageSquare, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTravelTier } from '@/lib/location';

const enquirySchema = z.object({
  clientName: z.string().min(2, 'Name required'),
  clientEmail: z.string().email('Valid email required'),
  clientPhone: z.string().min(10, 'Valid phone required'),
  postcode: z.string().min(2, 'Postcode required'),
  address: z.string().optional(),
  serviceName: z.string().optional(),
  message: z.string().min(20, 'Please tell us more (at least 20 characters)'),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  reason: z.enum(['out-of-area', 'general', 'custom-request']),
});

type EnquiryForm = z.infer<typeof enquirySchema>;

export function EnquiryForm() {
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [enquiryReference, setEnquiryReference] = useState<string | null>(null);

  const prefilledPostcode = searchParams.get('postcode') || '';
  const prefilledService = searchParams.get('service') || '';
  const prefilledType = searchParams.get('type') as 'out-of-area' | 'general' | 'custom-request' || 'general';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EnquiryForm>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      postcode: prefilledPostcode,
      serviceName: prefilledService,
      reason: prefilledType,
    },
  });

  const watchPostcode = watch('postcode');
  const watchReason = watch('reason');

  const tier = watchPostcode ? getTravelTier(watchPostcode) : null;

  const onSubmit = async (data: EnquiryForm) => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many enquiries. Please try again later.');
        }
        throw new Error('Failed to submit enquiry');
      }

      const result = await response.json();
      setEnquiryReference(result.enquiryReference);
      setSuccess(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (success && enquiryReference) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-2xl space-y-8 text-center"
      >
        <div className="rounded-lg bg-green-50 p-8">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Enquiry Received!</h2>
          <p className="mt-2 text-muted-foreground">
            Thank you for your enquiry. I'll review your request and get back to you within 24 hours.
          </p>
          <p className="mt-4 font-mono text-lg font-semibold text-primary" data-testid="enquiry-reference">{enquiryReference}</p>
          <p className="mt-2 text-sm text-muted-foreground">Save this reference for your records</p>
          <Button asChild className="mt-6">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl"
    >
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contact">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Submit an Enquiry</h1>
          <p className="text-muted-foreground">
            {watchReason === 'out-of-area'
              ? "Your postcode is outside my regular service area. Let me know if you'd like me to consider it."
              : 'Tell me about your service needs'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Information</CardTitle>
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
                placeholder="Your name"
                {...register('clientName')}
                data-testid="enquiry-name"
              />
              {errors.clientName && (
                <p className="text-sm text-destructive">{errors.clientName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </span>
              </Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="your@email.com"
                {...register('clientEmail')}
                data-testid="enquiry-email"
              />
              {errors.clientEmail && (
                <p className="text-sm text-destructive">{errors.clientEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </span>
              </Label>
              <Input
                id="clientPhone"
                type="tel"
                placeholder="07XXX XXXXXX"
                {...register('clientPhone')}
                data-testid="enquiry-phone"
              />
              {errors.clientPhone && (
                <p className="text-sm text-destructive">{errors.clientPhone.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location & Service */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location & Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Postcode
                </span>
              </Label>
              <Input
                id="postcode"
                placeholder="SM1 1AA"
                {...register('postcode')}
                data-testid="enquiry-postcode"
              />
              {errors.postcode && (
                <p className="text-sm text-destructive">{errors.postcode.message}</p>
              )}
              {tier && (
                <p className="text-sm text-muted-foreground">
                  {tier.enquiryOnly ? '📍 Outside regular service area' : `✓ ${tier.label}`}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                placeholder="Street address"
                {...register('address')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceName">Service of Interest (Optional)</Label>
              <Input
                id="serviceName"
                placeholder="e.g., Cut & blow dry"
                {...register('serviceName')}
                data-testid="enquiry-service"
              />
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preferred Date & Time (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  {...register('preferredDate')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Time</Label>
                <Input
                  id="preferredTime"
                  type="time"
                  {...register('preferredTime')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Tell me about your request
                </span>
              </Label>
              <Textarea
                id="message"
                placeholder="E.g., I'm looking for a mobile hairdresser for a regular appointment, or I have a specific request..."
                rows={4}
                {...register('message')}
                data-testid="enquiry-message"
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className="w-full"
          data-testid="submit-enquiry"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Enquiry'
          )}
        </Button>
      </form>
    </motion.div>
  );
}
