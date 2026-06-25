'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Cloud, CloudOff, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import * as sync from '@/lib/leo/sync';

/**
 * Settings card showing cloud-sync status. Hidden entirely when sync isn't
 * configured (so the on-device-only build shows nothing extra).
 */
export function SyncPanel() {
  const configured = sync.isSyncConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!configured) return;
    let active = true;
    sync.getSession().then((s) => active && setSession(s));
    const unsub = sync.onAuthChange((s) => setSession(s));
    return () => {
      active = false;
      unsub();
    };
  }, [configured]);

  if (!configured) return null;

  return (
    <Card className="border-ink-300/40 p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
        {session ? (
          <Cloud className="h-5 w-5 text-emerald-600" />
        ) : (
          <CloudOff className="h-5 w-5 text-ink-500" />
        )}
        Shared cloud sync
      </h2>

      {session ? (
        <>
          <p className="mb-4 text-sm text-ink-600">
            Signed in as <strong>{session.user.email}</strong>. Every entry and
            photo syncs automatically between your phone and Christina&apos;s —
            changes appear on both within seconds.
          </p>
          <div className="space-y-3">
            <Button
              size="lg"
              variant="outline"
              className="min-h-12 w-full justify-start"
              onClick={() => {
                toast({
                  title: 'Up to date',
                  description: 'Sync runs continuously in the background.',
                });
              }}
            >
              <RefreshCw className="mr-2 h-5 w-5" /> Sync is active
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="min-h-12 w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={async () => {
                await sync.signOut();
                sync.resetSyncCache();
                toast({ title: 'Signed out' });
              }}
            >
              <LogOut className="mr-2 h-5 w-5" /> Sign out
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-ink-600">
          You&apos;re signed out. Sign in again to resume syncing between
          phones.
        </p>
      )}
    </Card>
  );
}
