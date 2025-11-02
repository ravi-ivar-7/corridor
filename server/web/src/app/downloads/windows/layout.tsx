import { Metadata } from 'next';

const baseUrl = 'https://corridor.rknain.com';
const siteName = 'Corridor';

export const metadata: Metadata = {
  title: 'Corridor for Windows - Free Clipboard Sync Desktop App Download',
  description: 'Download Corridor for Windows 10/11. Free native desktop app with system tray integration, auto-start, and real-time clipboard sync. No installation required. 50MB download.',
  keywords: [
    'Windows clipboard sync',
    'Windows clipboard manager',
    'clipboard sync Windows 10',
    'clipboard sync Windows 11',
    'Windows clipboard app',
    'system tray clipboard',
    'Windows clipboard tool',
    'clipboard synchronization Windows',
    'Windows clipboard history',
    'free Windows clipboard app',
    'download clipboard Windows',
    'Windows 10 clipboard sync',
    'Windows 11 clipboard sync',
    'clipboard exe download',
    'portable clipboard app Windows'
  ],
  authors: [{ name: 'Corridor' }],
  creator: 'Corridor',
  publisher: 'Corridor',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/downloads/windows',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${baseUrl}/downloads/windows`,
    siteName,
    title: 'Corridor for Windows - Free Desktop Clipboard Sync',
    description: 'Native Windows app with system tray, auto-start, and instant sync. Works on Windows 10 and 11. Free download.',
    images: [
      {
        url: '/og-windows.png',
        width: 1200,
        height: 630,
        alt: 'Corridor for Windows',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corridor for Windows',
    description: 'Free clipboard sync app for Windows 10/11. System tray integration and auto-start.',
    images: ['/og-windows.png'],
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
