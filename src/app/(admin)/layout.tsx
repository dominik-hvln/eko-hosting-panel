'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserNav } from '@/components/UserNav';

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
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        try {
            const decodedToken = jwtDecode<JwtPayload>(token);
            if (decodedToken.role === 'admin') {
                setIsAuthorized(true);
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Invalid token:', error);
            router.push('/login');
        }
    }, [router]);

    if (!isAuthorized) {
        return <div className="flex h-screen items-center justify-center">Sprawdzanie uprawnień...</div>;
    }

    // Używamy teraz kolorów semantycznych, które będą reagować na zmianę motywu
    return (
        <div className="flex min-h-screen bg-secondary/50">
            <aside className="w-64 bg-background text-foreground border-r">
                <div className="p-4">
                    <h2 className="font-bold text-xl">Admin Panel</h2>
                </div>
                <nav className="flex flex-col p-2 space-y-1">
                    <Link href="/admin" className="p-2 rounded-md hover:bg-muted">Dashboard</Link>
                    <Link href="/admin/plans" className="p-2 rounded-md hover:bg-muted">Plany</Link>
                    <Link href="/admin/services" className="p-2 rounded-md hover:bg-muted">Usługi</Link>
                    <Link href="/admin/users" className="p-2 rounded-md hover:bg-muted">Użytkownicy</Link>
                    <Link href="/admin/tickets" className="p-2 rounded-md hover:bg-muted">Zgłoszenia</Link>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
                    <ThemeToggle />
                    <UserNav />
                </header>
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    );
}