import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider'; // Zmieniamy import
import { Toaster } from 'react-hot-toast';
import { QueryClientProviderComponent } from '@/components/QueryClientProviderComponent';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'EKO-HOSTING',
    description: 'Platforma do zarządzania hostingiem',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
        <QueryClientProviderComponent>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <Toaster position="bottom-right" />
            </ThemeProvider>
        </QueryClientProviderComponent>
        </body>
        </html>
    );
}