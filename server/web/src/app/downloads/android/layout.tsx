import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'Corridor for Android - Free Clipboard Sync APK Download',
  description: 'Download Corridor APK for Android 8.0+. Free mobile clipboard synchronization app with background service, auto-start, and clipboard history. 12MB download. Works on phones and tablets.',
  keywords: [
    'Android clipboard sync',
    'clipboard manager Android',
    'Android clipboard app',
    'clipboard sync APK',
    'Android clipboard history',
    'clipboard sharing Android',
    'Android clipboard tool',
    'clipboard synchronization Android',
    'free clipboard app Android',
    'clipboard APK download',
    'Android 8.0 clipboard',
    'mobile clipboard sync',
    'clipboard manager APK',
    'Android clipboard service',
    'clipboard app download Android'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/downloads/android',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${baseUrl}/downloads/android`,
    siteName,
    title: 'Corridor for Android - Free Clipboard Sync APK',
    description: 'Free Android clipboard sync with background service and auto-start. For Android 8.0+. Download APK now.',
    images: [
      {
        url: '/og-android.png',
        width: 1200,
        height: 630,
        alt: 'Corridor for Android',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corridor for Android',
    description: 'Free clipboard sync APK for Android 8.0+. Background service and auto-start.',
    images: ['/og-android.png'],
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
