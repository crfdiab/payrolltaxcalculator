import './globals.css';
import type { Metadata } from 'next';
import { Readex_Pro } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google'

const readexPro = Readex_Pro({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://payrolltaxcalculator.co.uk'),
  title: 'Take Home Pay Calculator | Take-Home Tax Calculator',
  description: 'Calculate your take-home pay with ease using our Take Home Pay Calculator. Quickly determine your net income after taxes and deductions.',
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={readexPro.className}>
        <GoogleAnalytics gaId="G-8KLGRTJB8N" />
        {children}
      </body>
    </html>
  );
}