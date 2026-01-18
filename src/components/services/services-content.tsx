'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scissors, Heart, ShoppingBag, Check, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SERVICES, type Service, type ServiceOption } from '@/content/services';
import { formatPrice, formatDuration } from '@/lib/utils';

const iconMap = {
  Scissors,
  Heart,
  ShoppingBag,
};

interface ServiceCardProps {
  option: ServiceOption;
  serviceId: string;
}

function ServiceOptionCard({ option, serviceId }: ServiceCardProps) {
  return (
    <Card className={`relative h-full transition-all duration-300 hover:shadow-md ${option.popular ? 'ring-2 ring-primary' : ''}`}>
      {option.popular && (
        <Badge className="absolute -top-3 left-4">Most Popular</Badge>
      )}
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{option.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{option.description}</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {formatPrice(option.price)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatDuration(option.duration)}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/booking?service=${serviceId}&option=${option.id}`}>
            Book Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ServiceSectionProps {
  service: Service;
  index: number;
}

function ServiceSection({ service, index }: ServiceSectionProps) {
  const Icon = iconMap[service.icon as keyof typeof iconMap];

  return (
    <section
      id={service.id}
      className="scroll-mt-24 section-padding border-b last:border-b-0"
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Section Header */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h2 className="heading-3">{service.title}</h2>
                  <p className="text-muted-foreground">{service.subtitle}</p>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">{service.description}</p>
            </div>

            {/* What's Included */}
            <Card className="w-full shrink-0 lg:w-80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What&apos;s Included</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {service.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                {service.note && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{service.note}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Service Options Grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {service.options.map((option) => (
              <ServiceOptionCard
                key={option.id}
                option={option}
                serviceId={service.id}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function ServicesContent() {
  return (
    <>
      {SERVICES.map((service, index) => (
        <ServiceSection key={service.id} service={service} index={index} />
      ))}
    </>
  );
}
