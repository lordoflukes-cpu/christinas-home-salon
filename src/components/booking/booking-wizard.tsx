'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingStore } from '@/lib/store';
import { BookingStepper } from './booking-stepper';
import { BookingSummary } from './booking-summary';
import { Step1ServiceType } from './step-1-service-type';
import { Step2Options } from './step-2-options';
import { Step3Location } from './step-3-location';
import { Step4DateTime } from './step-4-datetime';
import { Step5Details } from './step-5-details';
import { BookingConfirmation } from './booking-confirmation';

const STEPS = [
  { number: 1, title: 'Service Type', description: 'What would you like?' },
  { number: 2, title: 'Options', description: 'Choose your service' },
  { number: 3, title: 'Location', description: 'Where are you?' },
  { number: 4, title: 'Date & Time', description: 'When suits you?' },
  { number: 5, title: 'Your Details', description: 'Nearly there!' },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export function BookingWizard() {
  const { step, reset } = useBookingStore();
  const [isComplete, setIsComplete] = useState(false);
  const [[page, direction], setPage] = useState([step, 0]);

  // Sync with store changes
  useEffect(() => {
    setPage([step, step > page ? 1 : -1]);
  }, [step]);

  // Reset booking on unmount (optional - remove if you want persistence)
  useEffect(() => {
    return () => {
      // Uncomment to reset on leave:
      // reset();
    };
  }, [reset]);

  const handleComplete = () => {
    setIsComplete(true);
  };

  if (isComplete) {
    return <BookingConfirmation />;
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1ServiceType />;
      case 2:
        return <Step2Options />;
      case 3:
        return <Step3Location />;
      case 4:
        return <Step4DateTime />;
      case 5:
        return <Step5Details onComplete={handleComplete} />;
      default:
        return <Step1ServiceType />;
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Main wizard area */}
      <div className="lg:col-span-2">
        {/* Stepper */}
        <BookingStepper currentStep={step} />

        {/* Step content */}
        <div className="mt-8 min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Summary sidebar */}
      <div className="hidden lg:block">
        <BookingSummary />
      </div>

      {/* Mobile summary - shows at bottom */}
      <div className="lg:hidden">
        <BookingSummary />
      </div>
    </div>
  );
}
