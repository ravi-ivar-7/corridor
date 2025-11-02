import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'How to Use Corridor - Complete Setup Guide for All Platforms',
  description: 'Step-by-step guide to setup Corridor on Windows, Linux, Android, and Web. Learn how to get your token, install the app, and start syncing your clipboard across all devices.',
  keywords: [
    'how to use corridor',
    'corridor setup guide',
    'clipboard sync tutorial',
    'corridor installation',
    'how to sync clipboard',
    'clipboard sync setup',
    'corridor getting started',
    'clipboard sync guide',
    'install corridor',
    'corridor configuration',
    'clipboard sync tutorial Windows',
    'clipboard sync tutorial Linux',
    'clipboard sync tutorial Android',
    'how to install clipboard sync',
    'clipboard sync help'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/resources/how-to-use',
  },
  openGraph: {
    type: 'article',
    locale: 'en_US',
    url: `${baseUrl}/resources/how-to-use`,
    siteName,
    title: 'How to Use Corridor - Complete Setup Guide',
    description: 'Complete tutorial for setting up Corridor on all platforms. Get started with clipboard sync in minutes.',
    images: [
      {
        url: '/og-how-to.png',
        width: 1200,
        height: 630,
        alt: 'How to Use Corridor',
      },
    ],
    publishedTime: new Date('2024-11-02').toISOString(),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Use Corridor',
    description: 'Complete setup guide for Corridor clipboard sync on all platforms.',
    images: ['/og-how-to.png'],
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
