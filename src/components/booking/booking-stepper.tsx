'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { BookingStep } from '@/lib/store';

interface BookingStepperProps {
  currentStep: BookingStep;
}

const steps = [
  { number: 1, label: 'Service' },
  { number: 2, label: 'Options' },
  { number: 3, label: 'Location' },
  { number: 4, label: 'Date & Time' },
  { number: 5, label: 'Details' },
];

export function BookingStepper({ currentStep }: BookingStepperProps) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full">
      {/* Mobile: Simple progress */}
      <div className="mb-6 md:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-muted-foreground">
            {steps[currentStep - 1].label}
          </span>
        </div>
        <Progress value={progress} className="mt-2 h-2" />
      </div>

      {/* Desktop: Full stepper */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress line background */}
          <div className="absolute left-0 top-5 h-0.5 w-full bg-muted" />
          
          {/* Progress line filled */}
          <motion.div
            className="absolute left-0 top-5 h-0.5 bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                    }}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-colors',
                      isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'border-primary bg-background text-primary'
                        : 'border-muted bg-background text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      'mt-2 text-sm font-medium',
                      isCurrent
                        ? 'text-foreground'
                        : isCompleted
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
