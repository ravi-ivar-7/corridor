import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'What is Corridor? - Universal Clipboard Sync Explained',
  description: 'Corridor is a cross-platform clipboard synchronization tool for Windows, Linux, Android, and Web. Learn how it works, key features, and why you need it for seamless multi-device productivity.',
  keywords: [
    'what is corridor',
    'clipboard sync explained',
    'how clipboard sync works',
    'clipboard synchronization tool',
    'clipboard manager overview',
    'cross-platform clipboard sync',
    'clipboard sync features',
    'real-time clipboard sync',
    'clipboard sync benefits',
    'multi-device clipboard',
    'clipboard sync technology',
    'WebSocket clipboard sync',
    'clipboard sync guide'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/resources/what-is-corridor',
  },
  openGraph: {
    type: 'article',
    locale: 'en_US',
    url: `${baseUrl}/resources/what-is-corridor`,
    siteName,
    title: 'What is Corridor? - Clipboard Sync Explained',
    description: 'Learn about Corridor, how clipboard synchronization works across devices, and why it improves your productivity.',
    images: [
      {
        url: '/og-what-is.png',
        width: 1200,
        height: 630,
        alt: 'What is Corridor',
      },
    ],
    publishedTime: new Date('2024-11-02').toISOString(),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What is Corridor?',
    description: 'Learn about universal clipboard synchronization and how Corridor works.',
    images: ['/og-what-is.png'],
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
