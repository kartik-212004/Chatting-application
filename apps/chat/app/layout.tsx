import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import type React from 'react';

import type { Metadata } from 'next';
import localFont from 'next/font/local';

import '../styles/css/satoshi.css';
import './globals.css';

const satoshi = localFont({
  src: [
    {
      path: '../styles/fonts/Satoshi-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../styles/fonts/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../styles/fonts/Satoshi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../styles/fonts/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../styles/fonts/Satoshi-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Real Time Chat',
  description: 'A simple chat application UI',
  generator: 'v0.dev',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <body className={`${satoshi.variable} font-satoshi`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem
        >
          {children}
          <Toaster position='top-center' />
        </ThemeProvider>
      </body>
    </html>
  );
}
