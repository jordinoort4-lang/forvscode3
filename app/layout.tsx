import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SupabaseAuthProvider } from './components/SupabaseAuthProvider';

export const metadata: Metadata = {
  title: 'OSM Advisor - Tactical Analysis & Advisory Tool',
  description: 'Professional tactical analysis and advisory application for Online Soccer Manager players. Get 1 free calculation every week!',
  applicationName: 'OSM Advisor',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OSM Advisor',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'OSM Advisor',
    title: 'OSM Advisor - Tactical Analysis & Advisory Tool',
    description: 'Professional tactical analysis and advisory application for Online Soccer Manager players.',
  },
  twitter: {
    card: 'summary',
    title: 'OSM Advisor - Tactical Analysis & Advisory Tool',
    description: 'Professional tactical analysis and advisory application for Online Soccer Manager players.',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon-192x192.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OSM Advisor" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased">
        <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
      </body>
    </html>
  );
}
