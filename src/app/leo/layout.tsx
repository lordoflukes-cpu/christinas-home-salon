import type { Metadata, Viewport } from 'next';
import { LeoProvider, LeoShell } from '@/components/leo';
import { NightMeadow } from '@/components/leo/decor/night-meadow';

export const metadata: Metadata = {
  title: { absolute: 'Leo' },
  description: "Leo's baby tracker",
  manifest: '/leo/manifest.webmanifest',
  robots: { index: false, follow: false },
  icons: {
    icon: '/leo/icon-192.png',
    apple: '/leo/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Leo',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b1430',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function LeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <LeoProvider>
      <NightMeadow />
      <LeoShell>{children}</LeoShell>
    </LeoProvider>
  );
}
