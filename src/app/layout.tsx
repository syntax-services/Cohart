import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Aurora | Academic Intelligence & Campus OS',
  description:
    'Ultra-minimalist higher institution operating system, exam pass revision, interactive reader, and campus arena.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aurora',
  },
  icons: {
    icon: '/brand/logo.svg',
    apple: '/brand/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0D11',
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
    <html lang="en" className={`${plusJakartaSans.variable} dark`} style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.style.colorScheme = 'dark';
                  localStorage.setItem('cohart_theme', 'dark');
                  var savedFont = localStorage.getItem('cohart_font_size');
                  if (savedFont) {
                    document.documentElement.setAttribute('data-font-size', savedFont);
                  } else {
                    document.documentElement.setAttribute('data-font-size', 'normal');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#0B0D11] text-[#F3F4F6] antialiased font-sans">
        <ThemeProvider>{children}</ThemeProvider>

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
