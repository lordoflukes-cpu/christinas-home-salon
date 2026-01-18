'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/lib/store';

// Generate mock available dates (next 14 days, excluding Sundays)
function generateAvailableDates(): { date: string; dayName: string; dayNum: string; month: string; available: boolean }[] {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const isSunday = date.getDay() === 0;
    
    dates.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayNum: date.getDate().toString(),
      month: date.toLocaleDateString('en-GB', { month: 'short' }),
      available: !isSunday, // Sundays not available
    });
  }
  
  return dates;
}

// Generate mock time slots
function generateTimeSlots(): { time: string; label: string; available: boolean }[] {
  const slots = [
    { time: '09:00', label: '9:00 AM', available: true },
    { time: '10:00', label: '10:00 AM', available: true },
    { time: '11:00', label: '11:00 AM', available: Math.random() > 0.3 },
    { time: '12:00', label: '12:00 PM', available: Math.random() > 0.3 },
    { time: '13:00', label: '1:00 PM', available: true },
    { time: '14:00', label: '2:00 PM', available: Math.random() > 0.3 },
    { time: '15:00', label: '3:00 PM', available: true },
    { time: '16:00', label: '4:00 PM', available: Math.random() > 0.5 },
    { time: '17:00', label: '5:00 PM', available: Math.random() > 0.5 },
  ];
  
  return slots;
}

export function Step4DateTime() {
  const { selectedDate, selectedTime, setDateTime, nextStep, prevStep } = useBookingStore();
  const [dates] = useState(generateAvailableDates);
  const [times] = useState(generateTimeSlots);
  const [localDate, setLocalDate] = useState(selectedDate || '');
  const [localTime, setLocalTime] = useState(selectedTime || '');

  const handleContinue = () => {
    if (localDate && localTime) {
      setDateTime(localDate, localTime);
      nextStep();
    }
  };

  const selectedDateInfo = dates.find((d) => d.date === localDate);

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
            When works for you?
          </h2>
          <p className="text-muted-foreground">
            Select your preferred date and time
          </p>
        </div>
      </div>

      {/* TODO Note */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Availability shown is for demonstration</p>
              <p className="mt-1">
                Real-time availability will be integrated with a booking calendar
                (Calendly/Fresha) in the future. For now, I&apos;ll confirm your
                preferred time within 24 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-medium">Select a Date</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((dateObj) => (
              <button
                key={dateObj.date}
                onClick={() => dateObj.available && setLocalDate(dateObj.date)}
                disabled={!dateObj.available}
                className={cn(
                  'flex flex-col items-center rounded-lg border-2 px-4 py-3 transition-all',
                  localDate === dateObj.date
                    ? 'border-primary bg-primary/5'
                    : dateObj.available
                    ? 'border-transparent hover:border-muted bg-muted/30 hover:bg-muted/50'
                    : 'border-transparent bg-muted/20 opacity-50 cursor-not-allowed'
                )}
              >
                <span className="text-xs text-muted-foreground">
                  {dateObj.dayName}
                </span>
                <span className="text-lg font-semibold">{dateObj.dayNum}</span>
                <span className="text-xs text-muted-foreground">
                  {dateObj.month}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Selection - only show if date is selected */}
      {localDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  Select a Time for {selectedDateInfo?.dayName} {selectedDateInfo?.dayNum} {selectedDateInfo?.month}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {times.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setLocalTime(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                      'rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all',
                      localTime === slot.time
                        ? 'border-primary bg-primary text-primary-foreground'
                        : slot.available
                        ? 'border-transparent bg-muted/30 hover:border-muted hover:bg-muted/50'
                        : 'border-transparent bg-muted/20 text-muted-foreground line-through opacity-50 cursor-not-allowed'
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>

              {!times.some((t) => t.available) && (
                <p className="mt-4 text-sm text-muted-foreground">
                  No slots available on this day. Please select another date.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Selected summary */}
      {localDate && localTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg bg-green-50 p-4"
        >
          <p className="text-sm text-green-900">
            <span className="font-medium">Selected:</span>{' '}
            {selectedDateInfo?.dayName} {selectedDateInfo?.dayNum} {selectedDateInfo?.month} at{' '}
            {times.find((t) => t.time === localTime)?.label}
          </p>
        </motion.div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!localDate || !localTime}
          size="lg"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
