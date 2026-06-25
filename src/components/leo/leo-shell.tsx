'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { Baby, Home, ListChecks, Settings } from 'lucide-react';
import { useLeoStore, useNow, formatAge } from '@/lib/leo';
import { cn } from '@/lib/utils';

const NAV: { href: Route; label: string; icon: typeof Home }[] = [
  { href: '/leo' as Route, label: 'Home', icon: Home },
  { href: '/leo/log' as Route, label: 'Log', icon: ListChecks },
  { href: '/leo/settings' as Route, label: 'Settings', icon: Settings },
];

export function LeoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const profile = useLeoStore((s) => s.profile);
  const now = useNow(60_000);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-cream-50">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-cream-200 bg-cream-50/90 px-5 py-4 backdrop-blur">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Baby className="h-6 w-6" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-xl font-semibold text-sage-900">
            {profile?.name ?? 'Leo'}
          </p>
          {profile && (
            <p className="text-xs text-sage-600">
              {formatAge(profile.birth, now)}
            </p>
          )}
        </div>
      </header>

      <main className="flex-1 px-5 pb-28 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-md items-stretch border-t border-cream-200 bg-cream-50/95 backdrop-blur">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-rose-600' : 'text-sage-500 hover:text-sage-700',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
