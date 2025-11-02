import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'Privacy Policy - Corridor Clipboard Sync',
  description: 'Corridor Privacy Policy: Learn how we handle your clipboard data. We store only what\'s necessary for synchronization. No personal information, no analytics, no tracking. Token-based security.',
  keywords: [
    'corridor privacy policy',
    'clipboard sync privacy',
    'data privacy',
    'clipboard security',
    'privacy policy',
    'data protection',
    'clipboard data storage',
    'secure clipboard sync',
    'privacy terms',
    'data handling',
    'clipboard encryption',
    'token security',
    'no tracking clipboard',
    'clipboard privacy'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${baseUrl}/privacy`,
    siteName,
    title: 'Privacy Policy - Corridor',
    description: 'How Corridor handles your clipboard data. No personal information collected. Token-based security.',
    images: [
      {
        url: '/og-privacy.png',
        width: 1200,
        height: 630,
        alt: 'Corridor Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corridor Privacy Policy',
    description: 'Learn how Corridor protects your clipboard data. No tracking, no analytics.',
    images: ['/og-privacy.png'],
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
