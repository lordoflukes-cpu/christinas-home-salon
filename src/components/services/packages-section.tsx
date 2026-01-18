'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PACKAGES, formatFrequency, calculateSavings } from '@/content/packages';
import { formatPrice } from '@/lib/utils';

export function PackagesSection() {
  return (
    <section id="packages" className="scroll-mt-24 section-padding bg-gradient-to-b from-muted/30 to-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="h-6 w-6" />
          </div>
          <h2 className="mt-4 heading-2">Packages & Memberships</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Save money and enjoy regular care with our package deals. Combine
            services or commit to regular visits for the best value.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((pkg, index) => {
            const savings = calculateSavings(pkg);
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full ${
                    pkg.bestValue
                      ? 'ring-2 ring-primary shadow-lg'
                      : ''
                  }`}
                >
                  {pkg.bestValue && (
                    <Badge className="absolute -top-3 left-4 gap-1">
                      <Sparkles className="h-3 w-3" />
                      Best Value
                    </Badge>
                  )}
                  {pkg.popular && !pkg.bestValue && (
                    <Badge variant="secondary" className="absolute -top-3 left-4">
                      Popular
                    </Badge>
                  )}

                  <CardHeader>
                    <CardTitle>{pkg.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {pkg.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-foreground">
                        {formatPrice(pkg.price)}
                      </span>
                      {pkg.originalPrice > pkg.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(pkg.originalPrice)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatFrequency(pkg.frequency)}
                    </p>

                    {/* Savings badge */}
                    {savings > 0 && (
                      <Badge variant="success" className="mt-3">
                        Save {formatPrice(savings)}
                      </Badge>
                    )}

                    {/* What's included */}
                    <Separator className="my-4" />
                    <p className="text-sm font-medium text-foreground">
                      Includes:
                    </p>
                    <ul className="mt-3 space-y-2">
                      {pkg.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.service}
                            {item.description && (
                              <span className="block text-xs text-muted-foreground/70">
                                {item.description}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Note */}
                    {pkg.note && (
                      <p className="mt-4 text-xs text-muted-foreground">
                        {pkg.note}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/booking?package=${pkg.id}`}>
                        Get This Package
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Custom package note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-muted-foreground">
            Need something different?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact me
            </Link>{' '}
            to discuss a custom package tailored to your needs.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
