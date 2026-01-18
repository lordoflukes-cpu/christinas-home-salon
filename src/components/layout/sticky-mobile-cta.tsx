'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/lib/store';
import { BUSINESS_INFO } from '@/content/business';

export function StickyMobileWhatsAppCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { postcode } = useBookingStore();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      // Show after scrolling 30% or 300px down
      if (!hasScrolled && (scrollPercentage > 30 || window.scrollY > 300)) {
        setIsVisible(true);
        setHasScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled]);

  const whatsappNumber = BUSINESS_INFO.contact.whatsapp?.replace(/\D/g, '');
  const whatsappText = `Hi Christina, I'd like to book an appointment${postcode ? ` for postcode ${postcode}` : ''}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center gap-2 p-4 md:hidden"
          data-testid="sticky-mobile-cta"
        >
          <div className="pointer-events-auto flex w-full max-w-sm gap-2">
            {/* Book Button */}
            <Button
              asChild
              className="flex-1 bg-primary hover:bg-primary/90"
              size="lg"
              data-testid="sticky-book-button"
            >
              <a href="/booking">
                <Phone className="mr-2 h-4 w-4" />
                Book
              </a>
            </Button>

            {/* WhatsApp Button */}
            <Button
              asChild
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
              data-testid="sticky-whatsapp-button"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>

            {/* Close Button */}
            <Button
              variant="outline"
              size="icon"
              className="pointer-events-auto"
              onClick={() => setIsVisible(false)}
              aria-label="Close"
              data-testid="sticky-cta-close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
