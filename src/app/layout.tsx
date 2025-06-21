import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'EKO-HOSTING Panel',
    description: 'Nowoczesna platforma hostingowa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <Providers>
            {children}
            <Toaster position="bottom-right" /> {/* <-- DODAJEMY TOASTER */}
        </Providers>
        </body>
        </html>
    );
}