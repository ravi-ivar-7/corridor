import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'About Corridor - Universal Clipboard Synchronization Solution',
  description: 'Learn about Corridor, the universal clipboard synchronization solution. Available on Windows, Linux, Android, and Web. Lightning fast, secure, and cross-platform clipboard sync with history support.',
  keywords: [
    'about corridor',
    'clipboard sync features',
    'cross-platform clipboard tool',
    'clipboard synchronization app',
    'multi-platform sync',
    'clipboard history',
    'real-time sync',
    'secure clipboard',
    'clipboard manager features',
    'Windows Linux Android sync',
    'offline clipboard queue',
    'token-based authentication',
    'WebSocket sync',
    'productivity app',
    'clipboard sharing tool'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${baseUrl}/about`,
    siteName,
    title: 'About Corridor - Universal Clipboard Sync',
    description: 'Lightning fast, secure clipboard synchronization across Windows, Linux, Android, and Web. Learn why thousands choose Corridor for seamless multi-device productivity.',
    images: [
      {
        url: '/og-about.png',
        width: 1200,
        height: 630,
        alt: 'About Corridor - Features and Platforms',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Corridor - Universal Clipboard Sync',
    description: 'Lightning fast, secure clipboard synchronization across all your devices. Learn about Corridor features.',
    images: ['/og-about.png'],
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

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
