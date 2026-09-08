import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

import { ThemeProvider } from '@/providers/theme-provider';

export const metadata: Metadata = {
  title: 'LifeOS — Personal Operating System',
  description: 'AI-powered productivity, wellness, digital wellbeing, and personal development.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950 text-neutral-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
