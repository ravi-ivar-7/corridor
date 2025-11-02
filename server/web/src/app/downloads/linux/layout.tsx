import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'Corridor for Linux - Free Clipboard Sync for Ubuntu, Debian, Fedora',
  description: 'Download Corridor for Linux. Lightweight 3MB binary for Ubuntu 20.04+, Debian 11+, Fedora, and more. X11 & Wayland support. System tray integration. One-line install script available.',
  keywords: [
    'Linux clipboard sync',
    'Ubuntu clipboard manager',
    'Linux clipboard tool',
    'clipboard sync Ubuntu',
    'Debian clipboard app',
    'Fedora clipboard sync',
    'Linux clipboard history',
    'X11 clipboard sync',
    'Wayland clipboard manager',
    'GNOME clipboard tool',
    'KDE clipboard sync',
    'Linux clipboard app download',
    'Ubuntu 22.04 clipboard',
    'clipboard synchronization Linux',
    'free Linux clipboard manager'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/downloads/linux',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${baseUrl}/downloads/linux`,
    siteName,
    title: 'Corridor for Linux - Clipboard Sync for All Distros',
    description: 'Lightweight clipboard sync for Ubuntu, Debian, Fedora, and more. X11 & Wayland support. System tray integration.',
    images: [
      {
        url: '/og-linux.png',
        width: 1200,
        height: 630,
        alt: 'Corridor for Linux',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corridor for Linux',
    description: 'Free clipboard sync for Ubuntu, Debian, Fedora. X11 & Wayland support.',
    images: ['/og-linux.png'],
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
