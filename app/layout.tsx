import './globals.css';
import type { Metadata } from 'next';
import { Readex_Pro } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google'

const readexPro = Readex_Pro({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Payroll Tax Calculator',
  description: 'Calculate your UK payroll taxes',
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
