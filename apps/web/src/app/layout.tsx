import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'BrainvareHRM — People Operations Platform',
  description:
    'Complete hire-to-retire HR management platform with India-first compliance, payroll, attendance, leave, and employee lifecycle management.',
  keywords: 'HRM, HR management, payroll, attendance, leave management, India compliance',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
