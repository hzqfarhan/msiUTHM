import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { OfflineBanner } from '@/components/pwa/offline-banner';
import { BackgroundLayer } from '@/components/settings/background-layer';
import { Toaster } from '@/components/ui/sonner';

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
        {/* Custom background image */}
        <BackgroundLayer />

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
          className="flex min-h-dvh flex-col sidebar-content-offset transition-[padding] duration-300"
          id="main-container"
        >
          <OfflineBanner />

          <main className="flex-1 page-content pt-16 pb-6 lg:pt-4 lg:pb-6">
            <div className="mx-auto max-w-screen-lg px-3 py-2 lg:px-4 lg:py-3">
              {children}
              <Footer />
            </div>
          </main>
        </div>

        <InstallPrompt />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
