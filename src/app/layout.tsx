import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TickerWrapper } from '@/components/layout/ticker-wrapper';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { OfflineBanner } from '@/components/pwa/offline-banner';
import { MsibotFab } from '@/components/msibot/msibot-fab';
import { WelcomeToast } from '@/components/auth/welcome-toast';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';
import { Suspense } from 'react';
import { QuranAudioProvider } from '@/components/quran/audio-context';
import { GlobalAudioPlayer } from '@/components/quran/global-audio-player';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'MSI UTHM Companion',
    template: '%s | MSI UTHM',
  },
  description:
    'Aplikasi rasmi Masjid Sultan Ibrahim, UTHM — waktu solat, program, kemudahan & lain-lain.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MSI UTHM',
  },
  openGraph: {
    title: 'MSI UTHM Companion',
    description: 'Aplikasi rasmi Masjid Sultan Ibrahim, UTHM',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0f2f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0F1C' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased text-foreground`}>
        <QuranAudioProvider>
          {/* Background is now CSS-only via body::before — no BackgroundLayer component */}

          {/* Animated mesh background orbs — only 3 for performance */}
          <div className="mesh-orb mesh-orb-1" aria-hidden="true" />
          <div className="mesh-orb mesh-orb-2" aria-hidden="true" />
          <div className="mesh-orb mesh-orb-3" aria-hidden="true" />

          {/* Desktop sidebar — collapsible, hidden on mobile */}
          <Sidebar />

          {/* Mobile header with hamburger drawer — hidden on desktop */}
          <div className="lg:hidden">
            <Header />
          </div>

          {/* Main content */}
          <div
            className="flex min-h-dvh flex-col sidebar-content-offset transition-[padding] duration-300 pt-14 lg:pt-0"
            id="main-container"
          >
            <OfflineBanner />

            {/* Live news ticker — non-blocking with Suspense */}
            <Suspense fallback={null}>
              <TickerWrapper />
            </Suspense>

            <main className="flex-1 page-content pt-4 pb-6 lg:pt-4 lg:pb-6">
              <div className="mx-auto max-w-screen-lg px-3 py-2 lg:px-4 lg:py-3">
                {children}
                <Footer />
              </div>
            </main>
          </div>

          <InstallPrompt />
          <MsibotFab />
          <Suspense fallback={null}>
            <WelcomeToast />
          </Suspense>
          <GlobalAudioPlayer />
          <Toaster position="top-center" />
          <Analytics />
        </QuranAudioProvider>
      </body>
    </html>
  );
}
