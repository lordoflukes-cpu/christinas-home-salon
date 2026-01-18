'use client';

import { motion } from 'framer-motion';
import { Scissors, Heart, ShoppingBag, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/lib/store';
import type { ServiceCategory } from '@/content/services';

const serviceTypes = [
  {
    id: 'hairdressing' as ServiceCategory,
    title: 'Mobile Hairdressing',
    description: 'Professional hair care in your home',
    icon: Scissors,
    color: 'rose',
  },
  {
    id: 'companion' as ServiceCategory,
    title: 'Companion Visits',
    description: 'Friendly company and conversation',
    icon: Heart,
    color: 'sage',
  },
  {
    id: 'errands' as ServiceCategory,
    title: 'Errands & Assistance',
    description: 'Shopping, appointments, and more',
    icon: ShoppingBag,
    color: 'cream',
  },
  {
    id: 'packages' as const,
    title: 'Packages & Bundles',
    description: 'Combined services at great value',
    icon: Package,
    color: 'primary',
  },
];

const colorClasses = {
  rose: 'group-data-[selected=true]:border-rose-500 group-data-[selected=true]:bg-rose-50',
  sage: 'group-data-[selected=true]:border-sage-500 group-data-[selected=true]:bg-sage-50',
  cream: 'group-data-[selected=true]:border-amber-500 group-data-[selected=true]:bg-amber-50',
  primary: 'group-data-[selected=true]:border-primary group-data-[selected=true]:bg-primary/5',
};

const iconColorClasses = {
  rose: 'text-rose-500 group-data-[selected=true]:text-rose-600',
  sage: 'text-sage-500 group-data-[selected=true]:text-sage-600',
  cream: 'text-amber-500 group-data-[selected=true]:text-amber-600',
  primary: 'text-primary group-data-[selected=true]:text-primary',
};

export function Step1ServiceType() {
  const { serviceType, setServiceType, nextStep } = useBookingStore();

  const handleSelect = (type: ServiceCategory | 'packages') => {
    setServiceType(type);
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          What would you like to book?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Select the type of service you&apos;re interested in
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {serviceTypes.map((service) => {
          const isSelected = serviceType === service.id;
          return (
            <button
              key={service.id}
              onClick={() => handleSelect(service.id)}
              className="group text-left"
              data-selected={isSelected}
            >
              <Card
                className={cn(
                  'h-full cursor-pointer border-2 transition-all duration-200 hover:shadow-md',
                  colorClasses[service.color as keyof typeof colorClasses],
                  !isSelected && 'border-transparent hover:border-muted'
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted transition-colors',
                        iconColorClasses[service.color as keyof typeof iconColorClasses]
                      )}
                    >
                      <service.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
