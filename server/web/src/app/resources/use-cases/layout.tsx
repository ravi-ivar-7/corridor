import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'Corridor Use Cases - Practical Ways to Use Clipboard Sync',
  description: 'Discover practical use cases for Corridor clipboard sync. From study groups to programming labs, learn how real-time clipboard synchronization boosts collaboration and productivity.',
  keywords: [
    'clipboard sync use cases',
    'clipboard sync applications',
    'clipboard sync examples',
    'clipboard sync for collaboration',
    'clipboard sync productivity',
    'clipboard sync for students',
    'clipboard sync for developers',
    'multi-device clipboard uses',
    'clipboard sync workflow',
    'clipboard sharing use cases',
    'team clipboard sync',
    'study group clipboard',
    'programming clipboard sync',
    'clipboard sync benefits'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/resources/use-cases',
  },
  openGraph: {
    type: 'article',
    locale: 'en_US',
    url: `${baseUrl}/resources/use-cases`,
    siteName,
    title: 'Corridor Use Cases - Real-World Applications',
    description: 'Explore practical ways to use Corridor clipboard sync for collaboration, learning, and productivity.',
    images: [
      {
        url: '/og-use-cases.png',
        width: 1200,
        height: 630,
        alt: 'Corridor Use Cases',
      },
    ],
    publishedTime: new Date('2024-11-02').toISOString(),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corridor Use Cases',
    description: 'Practical ways to use clipboard sync for collaboration and productivity.',
    images: ['/og-use-cases.png'],
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
