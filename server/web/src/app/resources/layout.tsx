import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'Corridor Resources - Guides, Tutorials & Documentation',
  description: 'Complete guides and tutorials for Corridor clipboard sync. Learn how to use Corridor, explore use cases, and get started with multi-device clipboard synchronization.',
  keywords: [
    'clipboard sync guide',
    'clipboard tutorial',
    'how to sync clipboard',
    'clipboard sync documentation',
    'clipboard manager guide',
    'multi-device clipboard tutorial',
    'clipboard sync help',
    'clipboard sync resources',
    'clipboard sync setup guide',
    'clipboard sync tutorial',
    'cross-platform clipboard guide',
    'clipboard synchronization docs'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/resources',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${baseUrl}/resources`,
    siteName,
    title: 'Corridor Resources - Learn & Get Started',
    description: 'Comprehensive guides and tutorials for Corridor clipboard sync. Setup guides, use cases, and documentation.',
    images: [
      {
        url: '/og-resources.png',
        width: 1200,
        height: 630,
        alt: 'Corridor Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corridor Resources',
    description: 'Guides, tutorials, and documentation for Corridor clipboard sync.',
    images: ['/og-resources.png'],
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
