'use client'; // Ten layout jest interaktywny, więc musi być komponentem klienckim

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Link from "next/link";

// Definiujemy typ dla danych, które odczytamy z tokenu
interface JwtPayload {
    role: string;
}

export default function AdminLayout({
                                        children,
                                    }: {
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
        <div className="flex">
            {/* Tu w przyszłości będzie boczny panel nawigacyjny admina */}
            <aside className="w-64 bg-gray-800 text-white p-4">
                <h2 className="font-bold text-xl">Admin Panel</h2>
                <nav className="flex flex-col p-2">
                    <Link href="/admin" className="p-2 rounded-md hover:bg-gray-700">Dashboard</Link>
                    <Link href="/admin/plans" className="p-2 rounded-md hover:bg-gray-700">Plany</Link>
                    <Link href="/admin/users" className="p-2 rounded-md hover:bg-gray-700">Użytkownicy</Link>
                    <Link href="/admin/tickets" className="p-2 rounded-md hover:bg-gray-700">Zgłoszenia</Link> {/* <-- NOWY LINK */}
                </nav>
            </aside>
            <main className="flex-1 p-8 bg-gray-100">{children}</main>
        </div>
    );
}