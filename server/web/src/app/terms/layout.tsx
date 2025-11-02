import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'Terms of Service - Corridor Clipboard Sync',
  description: 'Corridor Terms of Service: Acceptable use policy, user responsibilities, and service terms. Learn about what you can and cannot do with Corridor clipboard synchronization.',
  keywords: [
    'corridor terms of service',
    'terms and conditions',
    'acceptable use policy',
    'service terms',
    'user agreement',
    'clipboard sync terms',
    'terms of use',
    'legal terms',
    'service agreement',
    'user responsibilities',
    'clipboard sync policy',
    'tos clipboard'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${baseUrl}/terms`,
    siteName,
    title: 'Terms of Service - Corridor',
    description: 'Corridor Terms of Service and acceptable use policy.',
    images: [
      {
        url: '/og-terms.png',
        width: 1200,
        height: 630,
        alt: 'Corridor Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corridor Terms of Service',
    description: 'Read our terms of service and acceptable use policy.',
    images: ['/og-terms.png'],
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
