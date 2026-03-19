import type { Metadata } from 'next';
import { Exo_2, Nunito_Sans, DM_Mono } from 'next/font/google';
import './globals.css';

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-exo2',
  display: 'swap',
});

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-nunito-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Striking Showcase — Collegiate Bowling Recruitment Platform',
    template: '%s | Striking Showcase',
  },
  description:
    'The premier platform connecting high school bowlers with collegiate programs. Build your recruiting portfolio, track stats, and get discovered by college coaches.',
  keywords: [
    'bowling',
    'recruitment',
    'collegiate bowling',
    'USBC',
    'NCAA bowling',
    'bowling portfolio',
    'bowling recruiting',
  ],
  openGraph: {
    title: 'Striking Showcase — Collegiate Bowling Recruitment Platform',
    description:
      'Build your recruiting portfolio, track stats, and get discovered by college coaches.',
    url: 'https://strikingshowcase.com',
    siteName: 'Striking Showcase',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Striking Showcase',
    description: 'Collegiate Bowling Recruitment Platform',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" data-color="maroon">
      <body
        className={`${nunitoSans.variable} ${exo2.variable} ${dmMono.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
