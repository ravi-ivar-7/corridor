import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4f46e5',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://corridor.rknain.com'),
  title: {
    default: 'Corridor - Real-Time Clipboard Sync Across All Devices',
    template: '%s | Corridor'
  },
  description: 'Sync your clipboard instantly across Windows, Linux, Android, and Web. Real-time clipboard synchronization made easy. Copy on one device, paste on another. Free, secure, and cross-platform.',
  applicationName: 'Corridor',
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  keywords: [
    'clipboard sync',
    'clipboard synchronization',
    'cross-platform clipboard',
    'clipboard manager',
    'real-time sync',
    'clipboard sharing',
    'multi-device clipboard',
    'Windows clipboard sync',
    'Linux clipboard sync',
    'Android clipboard sync',
    'universal clipboard',
    'clipboard history'
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/window.svg',
    shortcut: '/window.svg',
    apple: '/window.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://corridor.rknain.com',
    siteName: 'Corridor',
    title: 'Corridor - Real-Time Clipboard Sync Across All Devices',
    description: 'Sync your clipboard instantly across Windows, Linux, Android, and Web. Free, secure, and cross-platform.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corridor - Real-Time Clipboard Sync',
    description: 'Sync your clipboard instantly across Windows, Linux, Android, and Web.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'productivity',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
