'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scissors, Heart, ShoppingBag, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SERVICES } from '@/content/services';
import { formatPrice } from '@/lib/utils';

const iconMap = {
  Scissors,
  Heart,
  ShoppingBag,
  Package,
};

const colorMap: Record<string, string> = {
  rose: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
  sage: 'bg-sage-50 text-sage-600 group-hover:bg-sage-100',
  cream: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
};

export function ServicesPreview() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="heading-2"
          >
            Services for Women Only
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Professional hairdressing, genuine companionship, and helpful errands –
            all delivered with warmth and care to women in their own homes.
          </motion.p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            const colorClass = colorMap[service.color] || colorMap.rose;
            const lowestPrice = Math.min(...service.options.map((o) => o.price));

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/services#${service.id}`}>
                  <Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${colorClass}`}
                      >
                        {Icon && <Icon className="h-7 w-7" />}
                      </div>

                      <h3 className="mt-4 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {service.subtitle}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          From{' '}
                          <span className="font-semibold text-foreground">
                            {formatPrice(lowestPrice)}
                          </span>
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {service.options.length} options
                        </Badge>
                      </div>

                      <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        View details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}

          {/* Packages Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/services#packages">
              <Card className="group h-full cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 text-primary transition-colors group-hover:bg-primary/30">
                    <Package className="h-7 w-7" />
                  </div>

                  <h3 className="mt-4 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    Packages & Bundles
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Save with combined services and regular visit plans.
                  </p>

                  <div className="mt-4">
                    <Badge variant="success" className="text-xs">
                      Save up to £40/month
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View packages
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Button asChild size="lg">
            <Link href="/services">
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
