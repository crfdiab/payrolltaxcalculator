import './globals.css';
import type { Metadata } from 'next';
import { Readex_Pro } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google'

const readexPro = Readex_Pro({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UK Payroll Tax Calculator: Accurate Salary and Tax Estimates',
  description: 'Use our UK Payroll Tax Calculator for precise estimates of your salary, income tax, National Insurance contributions, and take-home pay.',
  canonical: 'https://payrolltaxcalculator.co.uk/', // Replace with your actual domain
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={metadata.canonical} />
      </head>
      <body className={readexPro.className}>
        <GoogleAnalytics gaId="G-8KLGRTJB8N" />
        {children}
      </body>
    </html>
  );
}