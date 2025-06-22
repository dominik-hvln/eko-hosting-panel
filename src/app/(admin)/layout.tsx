'use client'; // Ten layout jest interaktywny, więc musi być komponentem klienckim

import { UserNav } from '@/components/UserNav';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from "next/link";

// Definiujemy typ dla danych, które odczytamy z tokenu
interface JwtPayload {
    role: string;
}

export default function AdminLayout({ children }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Sprawdzamy token po załadowaniu komponentu w przeglądarce
        const token = localStorage.getItem('access_token');

        if (!token) {
            // Jeśli nie ma tokenu, od razu przekieruj na stronę logowania
            router.push('/login');
            return;
        }

        try {
            // Dekodujemy token, aby sprawdzić rolę
            const decodedToken = jwtDecode<JwtPayload>(token);
            if (decodedToken.role === 'admin') {
                // Jeśli rola się zgadza, pozwalamy na wyświetlenie treści
                setIsAuthorized(true);
            } else {
                // Jeśli to nie admin, przekierowujemy go do jego własnego dashboardu
                router.push('/dashboard');
            }
        } catch (error) {
            // Jeśli token jest niepoprawny lub uszkodzony
            console.error('Invalid token:', error);
            router.push('/login');
        }
    }, [router]);

    // Dopóki sprawdzamy uprawnienia, pokazujemy ekran ładowania
    if (!isAuthorized) {
        return <div className="flex h-screen items-center justify-center">Sprawdzanie uprawnień...</div>;
    }

    // Jeśli użytkownik jest autoryzowany, wyświetlamy właściwą treść
    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            <aside className="w-64 bg-gray-950 border-r border-gray-800">
                <div className="p-4"><h2 className="font-bold text-xl">Admin Panel</h2></div>
                <nav className="flex flex-col p-2 space-y-1">
                    <Link href="/admin" className="p-2 rounded-md hover:bg-gray-800">Dashboard</Link>
                    <Link href="/admin/plans" className="p-2 rounded-md hover:bg-gray-800">Plany</Link>
                    <Link href="/admin/users" className="p-2 rounded-md hover:bg-gray-800">Użytkownicy</Link>
                    <Link href="/admin/tickets" className="p-2 rounded-md hover:bg-gray-800">Zgłoszenia</Link>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="flex h-14 items-center justify-end gap-4 border-b border-gray-800 bg-gray-950 px-6">
                    <ThemeToggle />
                    <UserNav />
                </header>
                <main className="flex-1 p-8 bg-gray-900">{children}</main>
            </div>
        </div>
    );
}