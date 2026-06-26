'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import {
  Activity,
  GitCommitVertical,
  Home,
  Images,
  ListChecks,
  Settings,
} from 'lucide-react';
import { useLeoStore, useNow, formatAge } from '@/lib/leo';
import { cn } from '@/lib/utils';
import { PawMark } from './brand/paw-mark';

const NAV: { href: Route; label: string; icon: typeof Home }[] = [
  { href: '/leo' as Route, label: 'Home', icon: Home },
  {
    href: '/leo/timeline' as Route,
    label: 'Timeline',
    icon: GitCommitVertical,
  },
  { href: '/leo/health' as Route, label: 'Health', icon: Activity },
  { href: '/leo/routine' as Route, label: 'Routine', icon: ListChecks },
  { href: '/leo/memories' as Route, label: 'Memories', icon: Images },
  { href: '/leo/settings' as Route, label: 'Settings', icon: Settings },
];

export function LeoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const profile = useLeoStore((s) => s.profile);
  const now = useNow(60_000);

  return (
    <div className="leo-theme relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col text-ink-900">
      <header className="relative z-20">
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-950/40 text-gold-300 ring-1 ring-gold-400/30 backdrop-blur-sm">
            <PawMark className="h-6 w-6" />
          </span>
          <div className="leading-tight [text-shadow:0_1px_8px_rgba(6,10,28,0.8)]">
            <p className="font-serif text-2xl font-semibold tracking-wide text-parchment-50">
              {profile?.name ?? 'Leo'}
            </p>
            {profile && (
              <p className="font-hand text-base leading-none text-gold-200">
                {formatAge(profile.birth, now)}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-5 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-gold-400/15 bg-ink-950/90 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="flex items-stretch gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-all active:scale-90',
                  active
                    ? 'text-gold-200'
                    : 'text-parchment-200/70 hover:text-parchment-100',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="font-serif text-xs tracking-wide">
                  {label}
                </span>
                <span
                  className={cn(
                    'absolute -top-0.5 h-0.5 rounded-full bg-gold-400 transition-all duration-300',
                    active ? 'w-6 opacity-100' : 'w-0 opacity-0',
                  )}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
