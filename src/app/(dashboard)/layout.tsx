'use client';

import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { UserNav } from '@/components/UserNav'; // Importujemy UserNav
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) { router.push('/login'); }
        else { setIsVerified(true); }
    }, [router]);

    if (!isVerified) { return <div className="flex h-screen items-center justify-center">Weryfikacja...</div>; }

    return (
        <div className="flex min-h-screen flex-col">
            <ImpersonationBanner />
            <div className="flex flex-1">
                <aside className="w-64 bg-gray-100 dark:bg-gray-900 border-r">
                    <div className="p-4"><h2 className="font-bold text-xl">EKO-HOSTING</h2></div>
                    <nav className="flex flex-col p-2 space-y-1">
                        <Link href="/dashboard" className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">Dashboard</Link>
                        <Link href="/dashboard/services" className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">Usługi</Link>
                        <Link href="/dashboard/wallet" className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">Portfel</Link>
                        <Link href="/dashboard/tickets" className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">Zgłoszenia</Link>
                        <Link href="/dashboard/invoices" className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">Faktury</Link>
                        <Link href="/dashboard/settings" className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">Ustawienia</Link>
                    </nav>
                </aside>
                <div className="flex-1 flex flex-col">
                    <header className="flex h-14 items-center justify-end gap-4 border-b bg-white dark:bg-gray-950 px-6">
                        {/* Tutaj można dodać powiadomienia i saldo */}
                        <UserNav />
                    </header>
                    <main className="flex-1 p-8 bg-gray-50 dark:bg-black">{children}</main>
                </div>
            </div>
        </div>
    );
}