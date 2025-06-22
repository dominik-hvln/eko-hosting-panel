'use client'; // Ten layout sprawdza logowanie, więc musi być kliencki

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
        } else {
            // Na razie sprawdzamy tylko istnienie tokenu.
            // W przyszłości możemy tu weryfikować jego ważność.
            setIsVerified(true);
        }
    }, [router]);

    // Dopóki nie zweryfikujemy, pokazujemy ekran ładowania
    if (!isVerified) {
        return <div className="flex h-screen items-center justify-center">Weryfikacja...</div>;
    }

    // Jeśli użytkownik jest zweryfikowany, wyświetlamy layout panelu
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-50 border-r">
                <div className="p-4">
                    <h2 className="font-bold text-xl text-gray-800">EKO-HOSTING</h2>
                </div>
                <nav className="flex flex-col p-2">
                    <Link href="/dashboard" className="p-2 rounded-md hover:bg-gray-200">Dashboard</Link>
                    <Link href="/dashboard/wallet" className="p-2 rounded-md hover:bg-gray-200">Portfel</Link> {/* <-- NOWY LINK */}
                    <Link href="/dashboard/tickets" className="p-2 rounded-md hover:bg-gray-200">Zgłoszenia</Link>
                </nav>
            </aside>
            <main className="flex-1 p-8 bg-gray-100">{children}</main>
        </div>
    );
}