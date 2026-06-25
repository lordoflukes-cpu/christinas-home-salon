'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PawMark } from '@/components/leo/brand/paw-mark';
import * as sync from '@/lib/leo/sync';

/**
 * Gate the app behind the shared family login when cloud sync is configured.
 * When sync isn't configured (no Supabase env vars) this is a transparent
 * pass-through and the app runs purely on-device, exactly as before.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const configured = sync.isSyncConfigured();
  const [checked, setChecked] = useState(!configured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    sync.getSession().then((s) => {
      if (!active) return;
      setSession(s);
      setChecked(true);
    });
    const unsub = sync.onAuthChange((s) => {
      setSession(s);
      setChecked(true);
    });
    return () => {
      active = false;
      unsub();
    };
  }, [configured]);

  if (!configured) return <>{children}</>;
  if (!checked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-parchment-100/80">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!session) return <SignInScreen />;
  return <>{children}</>;
}

function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(mode: 'in' | 'up') {
    setBusy(true);
    setError(null);
    setNotice(null);
    const fn = mode === 'in' ? sync.signIn : sync.signUp;
    const { error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
    } else if (mode === 'up') {
      setNotice(
        'Account created. If sign-in doesn’t happen automatically, sign in below.',
      );
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 rounded-full bg-parchment-50/10 p-4 ring-1 ring-parchment-100/20">
        <PawMark className="h-9 w-9 text-amber-300" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-parchment-50">
        Leo
      </h1>
      <p className="mb-6 mt-1 flex items-center gap-1.5 text-sm text-parchment-100/70">
        <Lock className="h-3.5 w-3.5" /> Private — shared sign-in for Mummy
        &amp; Daddy
      </p>

      <form
        className="w-full space-y-3 text-left"
        onSubmit={(e) => {
          e.preventDefault();
          submit('in');
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="leo-email" className="text-parchment-100/80">
            Email
          </Label>
          <Input
            id="leo-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-parchment-100/20 bg-ink-950/40 text-parchment-50 placeholder:text-parchment-100/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="leo-password" className="text-parchment-100/80">
            Password
          </Label>
          <Input
            id="leo-password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-parchment-100/20 bg-ink-950/40 text-parchment-50 placeholder:text-parchment-100/40"
          />
        </div>

        {error && <p className="text-sm text-rose-300">{error}</p>}
        {notice && <p className="text-sm text-emerald-300">{notice}</p>}

        <Button
          type="submit"
          size="lg"
          disabled={busy}
          className="min-h-12 w-full bg-amber-400 text-ink-950 hover:bg-amber-300"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="ghost"
          disabled={busy}
          onClick={() => submit('up')}
          className="min-h-11 w-full text-parchment-100/70 hover:bg-parchment-50/10 hover:text-parchment-50"
        >
          First time? Create the shared account
        </Button>
      </form>
    </div>
  );
}
