'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTravelTier, isServiceable, normalizePostcode, getServiceAreaMessage } from '@/lib/location';
import { formatPrice } from '@/lib/utils';

export function PostcodeChecker() {
  const [postcode, setPostcode] = useState('');
  const [result, setResult] = useState<ReturnType<typeof getTravelTier> | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    const normalized = normalizePostcode(postcode);
    const tier = getTravelTier(normalized);
    setResult(tier);
    setSubmitted(true);
  };

  const handleReset = () => {
    setPostcode('');
    setResult(null);
    setSubmitted(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl bg-gradient-to-br from-rose-50 to-primary/5 p-8 shadow-lg"
    >
      <div className="mx-auto max-w-md">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Check Your Area</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Enter your postcode to see travel fees and availability
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="e.g., SM1 1AA"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  className="text-center"
                  aria-label="Postcode"
                  data-testid="postcode-input"
                />
              </div>
              <Button type="submit" disabled={!postcode.trim()} data-testid="postcode-search-button">
                <Search className="h-4 w-4" />
                <span className="sr-only">Check</span>
              </Button>
            </div>
          </form>
        ) : result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
            data-testid="postcode-result"
          >
            {/* Postcode Display */}
            <div className="rounded-lg bg-white p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Your postcode</p>
              <p className="font-mono text-xl font-bold text-foreground">{normalizePostcode(postcode)}</p>
            </div>

            {/* Travel Tier Badge */}
            <div className="flex items-center justify-center">
              <Badge
                variant={result.enquiryOnly ? 'outline' : 'default'}
                className={
                  result.enquiryOnly
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : result.fee === 0
                      ? 'bg-green-50 text-green-900 border-green-300'
                      : 'bg-blue-50 text-blue-900 border-blue-300'
                }
              >
                <MapPin className="mr-1 h-3 w-3" />
                {result.label}
              </Badge>
            </div>

            {/* Travel Fee or Status */}
            <div className="space-y-1 text-center">
              {result.enquiryOnly ? (
                <>
                  <p className="text-sm font-semibold text-amber-900">Outside regular service area</p>
                  <p className="text-xs text-amber-800">We may still be able to help</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Travel fee</p>
                  <p className="text-2xl font-bold text-primary">
                    {result.fee === 0 ? 'FREE' : formatPrice(result.fee)}
                  </p>
                </>
              )}
            </div>

            {/* Distance Info */}
            {result.distanceMiles !== null && (
              <p className="text-center text-xs text-muted-foreground">
                ~{result.distanceMiles} miles from Sutton
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {result.enquiryOnly ? (
                <>
                  <Button asChild className="flex-1" data-testid="send-enquiry-button">
                    <Link href={`/contact?type=enquiry&postcode=${encodeURIComponent(normalizePostcode(postcode))}`}>
                      Send Enquiry
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Try Another
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="flex-1" data-testid="book-now-button">
                    <Link href={`/booking?postcode=${encodeURIComponent(normalizePostcode(postcode))}`}>
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Try Another
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
