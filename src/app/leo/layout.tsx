import type { Metadata, Viewport } from 'next';
import { LeoProvider, LeoShell } from '@/components/leo';

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
  themeColor: '#f43f5e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function LeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <LeoProvider>
      <LeoShell>{children}</LeoShell>
    </LeoProvider>
  );
}
