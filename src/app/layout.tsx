import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Cohart | Student Lifecycle & Academic Intelligence Engine',
  description:
    'Minimalist student lifecycle companion, interactive personalized reader, schedule tracking, and campus navigation.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cohart',
  },
  icons: {
    icon: '/brand/logo.svg',
    apple: '/brand/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#06080D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#06080D" />
      </head>
      <body className="min-h-screen bg-[#06080D] text-white antialiased font-sans selection:bg-[#387BFF]/30 selection:text-white">
        {children}

        {/* Service Worker Registration for PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[Cohart PWA] ServiceWorker registered with scope:', registration.scope);
                    },
                    function(err) {
                      console.log('[Cohart PWA] ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
