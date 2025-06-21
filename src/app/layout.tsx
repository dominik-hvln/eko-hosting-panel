import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers'; // <-- 1. Importujemy

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'EKO-HOSTING Panel',
    description: 'Nowoczesna platforma hostingowa',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        {/* 2. Owijamy całą zawartość w nasz komponent Providers */}
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}