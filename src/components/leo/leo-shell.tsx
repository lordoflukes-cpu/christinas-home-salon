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
    <div className="leo-theme relative mx-auto flex min-h-screen w-full max-w-md flex-col text-ink-900">
      <header className="relative z-20">
        <div className="flex items-center gap-3 border-b border-ink-300/40 bg-parchment-50/70 px-5 py-4 backdrop-blur-sm">
          <LionCrest className="h-11 w-11 shrink-0" />
          <div className="leading-tight">
            <p className="font-serif text-2xl font-semibold tracking-wide text-ink-900">
              {profile?.name ?? 'Leo'}
            </p>
            {profile && (
              <p className="font-hand text-base leading-none text-ink-500">
                {formatAge(profile.birth, now)}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-5 pb-28 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-ink-300/50 bg-parchment-100/90 px-2 py-2 backdrop-blur">
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
                  active ? 'text-ink-900' : 'text-ink-400 hover:text-ink-700',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="font-serif text-xs tracking-wide">
                  {label}
                </span>
                <span
                  className={cn(
                    'absolute -top-0.5 h-0.5 rounded-full bg-gold-500 transition-all duration-300',
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
