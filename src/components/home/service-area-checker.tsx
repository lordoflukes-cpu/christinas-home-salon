'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Check, X, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { checkServiceArea, isValidUKPostcode, formatPostcode } from '@/lib/pricing';
import { BUSINESS_INFO } from '@/content/business';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export function ServiceAreaChecker() {
  const [postcode, setPostcode] = useState('');
  const [result, setResult] = useState<ReturnType<typeof checkServiceArea> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    setError('');
    
    if (!postcode.trim()) {
      setError('Please enter a postcode');
      return;
    }

    if (!isValidUKPostcode(postcode)) {
      setError('Please enter a valid UK postcode (e.g., SM1 1AA)');
      return;
    }

    setLoading(true);
    
    // Simulate a short delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const areaResult = checkServiceArea(postcode);
    setResult(areaResult);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left side - Info */}
              <div className="bg-primary p-8 text-primary-foreground">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <MapPin className="h-10 w-10" />
                  <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                    Check Your Area
                  </h2>
                  <p className="mt-3 text-primary-foreground/80">
                    Enter your postcode to see if you&apos;re within my service area
                    and check any travel fees that may apply.
                  </p>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Based in {BUSINESS_INFO.baseTown}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Core area: 0-6 miles (FREE)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Extended: 6-10 miles (£5)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Distant: 10-15 miles (£12)</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right side - Checker */}
              <CardContent className="flex flex-col justify-center p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="postcode"
                      className="block text-sm font-medium text-foreground"
                    >
                      Your Postcode
                    </label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="postcode"
                        type="text"
                        placeholder="e.g. CM1 1AA"
                        value={postcode}
                        onChange={(e) => {
                          setPostcode(e.target.value.toUpperCase());
                          setError('');
                          setResult(null);
                        }}
                        onKeyDown={handleKeyDown}
                        className="uppercase"
                        maxLength={8}
                      />
                      <Button
                        onClick={handleCheck}
                        disabled={loading}
                        className="shrink-0"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Check'
                        )}
                      </Button>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-destructive">{error}</p>
                    )}
                  </div>

                  {/* Result */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg p-4 ${
                        result.isInArea
                          ? 'bg-green-50 text-green-900'
                          : result.requiresEnquiry
                          ? 'bg-amber-50 text-amber-900'
                          : 'bg-red-50 text-red-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {result.isInArea ? (
                          <Check className="mt-0.5 h-5 w-5 text-green-600" />
                        ) : result.requiresEnquiry ? (
                          <MessageCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                        ) : (
                          <X className="mt-0.5 h-5 w-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{result.message}</p>
                          {result.isInArea && result.travelFee > 0 && (
                            <p className="mt-1 text-sm">
                              Travel fee: {formatPrice(result.travelFee)}
                            </p>
                          )}
                          {result.isInArea && result.travelFee === 0 && (
                            <p className="mt-1 text-sm">No travel fee! 🎉</p>
                          )}
                          {result.isInArea && (
                            <Button asChild size="sm" className="mt-3">
                              <Link href="/booking">Book Now</Link>
                            </Button>
                          )}
                          {result.requiresEnquiry && !result.isInArea && (
                            <Button asChild size="sm" variant="outline" className="mt-3">
                              <Link href="/contact?enquiry=travel">
                                Send Enquiry
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Further away? Send an enquiry – I may still be able to help 
                    for the right appointment.
                  </p>
                </motion.div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
