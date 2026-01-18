'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, ArrowLeft, Sparkles, Plus, Minus, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, formatPrice, formatDuration } from '@/lib/utils';
import { useBookingStore, type SelectedAddOn, type AdditionalClient } from '@/lib/store';
import { 
  SERVICES, 
  getServiceById, 
  getServiceOptionById,
  getAddOnsForCategory,
  isTimeBasedService,
  getTimeBasedDurationOptions,
  calculateTimeBasedPrice,
} from '@/content/services';
import { PACKAGES, calculateSavings, formatFrequency } from '@/content/packages';
import { PRICING_CONFIG } from '@/lib/pricing/config';

export function Step2Options() {
  const { 
    serviceType, 
    selectedOption, 
    selectedAddOns,
    timeBasedSelection,
    hairLengthSurcharge,
    additionalClients,
    setSelectedOption, 
    setAddOns,
    addAddOn,
    removeAddOn,
    setTimeBasedSelection,
    setHairLengthSurcharge,
    setAdditionalClients,
    addAdditionalClient,
    removeAdditionalClient,
    nextStep, 
    prevStep,
  } = useBookingStore();

  // Local state for group booking UI
  const [showGroupBooking, setShowGroupBooking] = useState(additionalClients.length > 0);

  if (!serviceType) {
    return null;
  }

  // Handle packages separately
  if (serviceType === 'packages') {
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
              Choose a Package
            </h2>
            <p className="text-muted-foreground">
              Select the package that best fits your needs
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PACKAGES.map((pkg) => {
            const isSelected = selectedOption === pkg.id;
            const savings = calculateSavings(pkg);

            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedOption(pkg.id)}
                className="group text-left"
                data-selected={isSelected}
                data-testid="service-option"
              >
                <Card
                  className={cn(
                    'relative h-full cursor-pointer border-2 transition-all duration-200 hover:shadow-md',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-muted'
                  )}
                >
                  {pkg.bestValue && (
                    <Badge className="absolute -top-3 left-4 gap-1">
                      <Sparkles className="h-3 w-3" />
                      Best Value
                    </Badge>
                  )}
                  {isSelected && (
                    <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {pkg.description}
                    </p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {formatPrice(pkg.price)}
                      </span>
                      {savings > 0 && (
                        <Badge variant="success" className="text-xs">
                          Save {formatPrice(savings)}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatFrequency(pkg.frequency)}
                    </p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={nextStep} disabled={!selectedOption} size="lg">
            Continue
          </Button>
        </div>
      </motion.div>
    );
  }

  // Regular services
  const service = getServiceById(serviceType);
  if (!service) {
    return null;
  }

  // Get the selected option details
  const currentOption = selectedOption ? getServiceOptionById(selectedOption) : null;
  
  // Check if current option is time-based
  const isTimeBased = currentOption ? isTimeBasedService(currentOption) : false;
  
  // Get duration options for time-based services
  const durationOptions = isTimeBased && currentOption ? getTimeBasedDurationOptions(currentOption) : [];
  
  // Get available add-ons for this category
  const availableAddOns = getAddOnsForCategory(serviceType);
  
  // Check if hair length surcharge applies to this service
  const showHairLengthSurcharge = currentOption?.hairLengthSurchargeEligible ?? false;
  
  // Determine if we can proceed
  const canContinue = selectedOption && (!isTimeBased || timeBasedSelection);

  // Handle duration selection for time-based services
  const handleDurationSelect = (hours: number) => {
    if (currentOption && isTimeBased) {
      const price = calculateTimeBasedPrice(currentOption, hours);
      setTimeBasedSelection({ hours, price });
    }
  };

  // Handle add-on toggle
  const handleAddOnToggle = (addon: { id: string; name: string; price: number; duration: number }) => {
    const existing = selectedAddOns.find(a => a.id === addon.id);
    if (existing) {
      removeAddOn(addon.id);
    } else {
      addAddOn(addon);
    }
  };

  // Handle adding additional client for group booking
  const handleAddClient = () => {
    if (additionalClients.length < PRICING_CONFIG.groupBooking.maxAdditionalClients) {
      // Default to the same service as the main client
      if (currentOption) {
        addAdditionalClient({
          serviceName: currentOption.name,
          serviceId: currentOption.id,
          price: currentOption.price,
          duration: currentOption.duration,
        });
      }
    }
  };

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
            Choose Your {service.title}
          </h2>
          <p className="text-muted-foreground">
            Select the option that best suits you
          </p>
        </div>
      </div>

      {/* Service Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {service.options
          .filter(option => !option.addOnFor) // Don't show add-ons as main options
          .map((option) => {
            const isSelected = selectedOption === option.id;
            const optionIsTimeBased = isTimeBasedService(option);

            return (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedOption(option.id);
                  // Reset time-based selection when changing options
                  if (!optionIsTimeBased) {
                    setTimeBasedSelection(null);
                  }
                }}
                className="group text-left"
                data-selected={isSelected}
                data-testid="service-option"
              >
                <Card
                  className={cn(
                    'relative h-full cursor-pointer border-2 transition-all duration-200 hover:shadow-md',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-muted',
                    option.popular && !isSelected && 'ring-1 ring-primary/20'
                  )}
                >
                  {option.popular && (
                    <Badge className="absolute -top-3 left-4">Most Popular</Badge>
                  )}
                  {isSelected && (
                    <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground">{option.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {option.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      {optionIsTimeBased ? (
                        <span className="text-lg font-bold text-foreground">
                          From {formatPrice(option.price)}
                          <span className="text-sm font-normal text-muted-foreground">/hr</span>
                        </span>
                      ) : (
                        <span className="text-2xl font-bold text-foreground">
                          {formatPrice(option.price)}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {optionIsTimeBased ? (
                          `Min ${formatDuration(option.minDurationMinutes || option.duration)}`
                        ) : (
                          formatDuration(option.duration)
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
      </div>

      {/* Time-based duration selector */}
      <AnimatePresence>
        {isTimeBased && currentOption && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-dashed">
              <CardContent className="p-5">
                <h4 className="font-semibold text-foreground mb-3">
                  How long do you need?
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {durationOptions.map(({ hours, minutes, price }) => {
                    const isSelected = timeBasedSelection?.hours === hours;
                    return (
                      <button
                        key={minutes}
                        onClick={() => handleDurationSelect(hours)}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all text-center',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        )}
                      >
                        <div className="font-semibold">{hours} {hours === 1 ? 'hour' : 'hours'}</div>
                        <div className="text-sm text-muted-foreground">{formatPrice(price)}</div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hair Length Surcharge */}
      <AnimatePresence>
        {showHairLengthSurcharge && selectedOption && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-dashed">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hair-length"
                    checked={hairLengthSurcharge}
                    onCheckedChange={(checked) => setHairLengthSurcharge(checked === true)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="hair-length" className="font-semibold cursor-pointer">
                      {PRICING_CONFIG.surcharges.hairLength.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add {formatPrice(PRICING_CONFIG.surcharges.hairLength.amount)} for long or thick hair (below shoulder length)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add-ons section */}
      <AnimatePresence>
        {availableAddOns.length > 0 && selectedOption && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="p-5">
                <h4 className="font-semibold text-foreground mb-3">
                  Enhance Your Service
                </h4>
                <div className="space-y-3">
                  {availableAddOns.map((addon) => {
                    const isSelected = selectedAddOns.some(a => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        )}
                        onClick={() => handleAddOnToggle({
                          id: addon.id,
                          name: addon.name,
                          price: addon.price,
                          duration: addon.duration,
                        })}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleAddOnToggle({
                            id: addon.id,
                            name: addon.name,
                            price: addon.price,
                            duration: addon.duration,
                          })}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{addon.name}</div>
                          <p className="text-sm text-muted-foreground">{addon.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">+{formatPrice(addon.price)}</div>
                          <div className="text-xs text-muted-foreground">+{formatDuration(addon.duration)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Booking section - only for hairdressing */}
      {PRICING_CONFIG.groupBooking.enabled && serviceType === 'hairdressing' && selectedOption && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">
                  Bringing Others?
                </h4>
              </div>
              {!showGroupBooking && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGroupBooking(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Guest
                </Button>
              )}
            </div>

            {showGroupBooking && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Save {formatPrice(PRICING_CONFIG.groupBooking.discountPerClient)} per additional person!
                </p>
                
                {additionalClients.map((client, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <Select
                        value={client.serviceId}
                        onValueChange={(value: string) => {
                          const option = service.options.find(o => o.id === value);
                          if (option) {
                            const updated = [...additionalClients];
                            updated[index] = {
                              serviceName: option.name,
                              serviceId: option.id,
                              price: option.price,
                              duration: option.duration,
                            };
                            setAdditionalClients(updated);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {service.options
                            .filter(o => !o.addOnFor && !isTimeBasedService(o))
                            .map(option => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name} - {formatPrice(option.price)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeAdditionalClient(index);
                        if (additionalClients.length === 1) {
                          setShowGroupBooking(false);
                        }
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {additionalClients.length < PRICING_CONFIG.groupBooking.maxAdditionalClients && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddClient}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Another Guest
                  </Button>
                )}

                {additionalClients.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    You'll save {formatPrice(additionalClients.length * PRICING_CONFIG.groupBooking.discountPerClient)}!
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={nextStep} disabled={!canContinue} size="lg">
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
