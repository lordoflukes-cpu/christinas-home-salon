'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { Activity, BookHeart, Home, Images, Settings } from 'lucide-react';
import { useLeoStore, useNow, formatAge } from '@/lib/leo';
import { cn } from '@/lib/utils';
import { LionCrest } from './brand/lion-crest';

const NAV: { href: Route; label: string; icon: typeof Home }[] = [
  { href: '/leo' as Route, label: 'Home', icon: Home },
  { href: '/leo/log' as Route, label: 'Log', icon: BookHeart },
  { href: '/leo/health' as Route, label: 'Health', icon: Activity },
  { href: '/leo/memories' as Route, label: 'Memories', icon: Images },
  { href: '/leo/settings' as Route, label: 'Settings', icon: Settings },
];

export function LeoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const profile = useLeoStore((s) => s.profile);
  const now = useNow(60_000);

  return (
    <div className="leo-aurora relative mx-auto flex min-h-screen w-full max-w-md flex-col">
      <div
        aria-hidden
        className="leo-ankara pointer-events-none absolute inset-0 opacity-60"
      />

      <header className="relative z-20">
        <div className="flex items-center gap-3 bg-cream-50/80 px-5 py-4 backdrop-blur">
          <LionCrest className="h-11 w-11 shrink-0" />
          <div className="leading-tight">
            <p className="font-display text-xl font-semibold text-night-900">
              {profile?.name ?? 'Leo'}
            </p>
            {profile && (
              <p className="text-xs font-medium text-gold-700">
                {formatAge(profile.birth, now)}
              </p>
            )}
          </div>
        </div>
        <div className="leo-greek-key h-2.5 w-full" />
      </header>

      <main className="relative z-10 flex-1 px-5 pb-28 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-cream-200 bg-cream-50/95 px-2 py-2 backdrop-blur">
        <div className="flex items-stretch gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-all active:scale-95',
                  active
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-sage-500 hover:bg-cream-100 hover:text-sage-700',
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
