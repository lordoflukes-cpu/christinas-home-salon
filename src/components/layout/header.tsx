'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Scissors, Heart, ShoppingBag, Package, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BUSINESS_INFO } from '@/content/business';
import type { Route } from 'next';

const navLinks = [
  { href: '/' as Route, label: 'Home' },
  {
    href: '/services' as Route,
    label: 'Services',
    children: [
      { href: '/services#hairdressing' as Route, label: 'Mobile Hairdressing', icon: Scissors },
      { href: '/services#companion' as Route, label: 'Companion Visits', icon: Heart },
      { href: '/services#errands' as Route, label: 'Errands & Assistance', icon: ShoppingBag },
      { href: '/services#packages' as Route, label: 'Packages & Bundles', icon: Package },
    ],
  },
  { href: '/about' as Route, label: 'About' },
  { href: '/reviews' as Route, label: 'Reviews' },
  { href: '/safety' as Route, label: 'Safety & Boundaries' },
  { href: '/contact' as Route, label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [servicesOpen, setServicesOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="container-custom">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Scissors className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-bold text-foreground">
                Christina&apos;s
              </span>
              <span className="block text-xs text-muted-foreground">
                Care Services
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-primary',
                      pathname === link.href
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn(
                      'h-4 w-4 transition-transform',
                      servicesOpen && 'rotate-180'
                    )} />
                  </Link>
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full pt-2"
                      >
                        <div className="w-64 rounded-xl border bg-card p-2 shadow-lg">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                              <child.icon className="h-4 w-4 text-primary" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-primary',
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${BUSINESS_INFO.contact.phone.replace(/\s/g, '')}`}
              className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:flex"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden xl:inline">{BUSINESS_INFO.contact.phone}</span>
            </a>
            <Button asChild size="lg" className="hidden sm:inline-flex">
              <Link href="/booking">Book Now</Link>
            </Button>
            <Button asChild size="sm" className="sm:hidden">
              <Link href="/booking">Book</Link>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t bg-background lg:hidden"
            >
              <div className="space-y-1 py-4">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          'block rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent',
                          pathname === link.href
                            ? 'text-primary'
                            : 'text-foreground'
                        )}
                      >
                        {link.label}
                      </Link>
                      <div className="ml-4 space-y-1 border-l pl-4">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            <child.icon className="h-4 w-4 text-primary" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'block rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent',
                        pathname === link.href
                          ? 'text-primary'
                          : 'text-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <div className="border-t pt-4">
                  <a
                    href={`tel:${BUSINESS_INFO.contact.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-primary"
                  >
                    <Phone className="h-5 w-5" />
                    Call {BUSINESS_INFO.contact.phone}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
