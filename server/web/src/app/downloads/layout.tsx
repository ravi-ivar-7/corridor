import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'Download Corridor - Free Clipboard Sync for Windows, Linux, Android & Web',
  description: 'Download Corridor for free. Native apps for Windows, Linux, and Android. Real-time clipboard synchronization across all your devices. No account required. Start syncing today.',
  keywords: [
    'download corridor',
    'clipboard sync download',
    'free clipboard app',
    'Windows clipboard sync download',
    'Linux clipboard app',
    'Android clipboard sync',
    'clipboard manager download',
    'cross-platform clipboard',
    'free download',
    'clipboard tool download',
    'multi-device sync app',
    'productivity app download',
    'clipboard history app',
    'real-time sync download',
    'clipboard APK download',
    'clipboard exe download'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/downloads',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${baseUrl}/downloads`,
    siteName,
    title: 'Download Corridor - Free Clipboard Sync App',
    description: 'Download Corridor for Windows, Linux, Android, or use the web app. Free, secure, and instant clipboard synchronization.',
    images: [
      {
        url: '/og-downloads.png',
        width: 1200,
        height: 630,
        alt: 'Download Corridor for All Platforms',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download Corridor - Free Clipboard Sync',
    description: 'Free clipboard sync for Windows, Linux, Android & Web. Download now and start syncing.',
    images: ['/og-downloads.png'],
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
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
