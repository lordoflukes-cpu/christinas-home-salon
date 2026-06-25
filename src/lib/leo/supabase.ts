/**
 * Supabase client for Leo's shared cloud sync.
 *
 * Cloud sync is OPTIONAL and feature-flagged by environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * When they are absent (e.g. local dev, or before sync is set up) the whole
 * app falls back to on-device IndexedDB storage and behaves exactly as before.
 * The anon/public key is designed to ship in the client; it is NOT a secret.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** True when both env vars are present, so cloud sync can be attempted. */
export function isSyncConfigured(): boolean {
  return Boolean(url && anonKey);
}

/** The shared Supabase client, or `null` when sync isn't configured. */
export function getSupabase(): SupabaseClient | null {
  if (!isSyncConfigured()) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Single shared family login — keep the session on the device.
        storageKey: 'leo-auth',
      },
    });
  }
  return client;
}
