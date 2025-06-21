'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Definicja typu pozostaje bez zmian
interface DashboardSummary {
    balance: string;
    ekoPoints: number;
    services: {
        id: string;
        name: string;
        status: string;
        plan: {
            name: string;
        };
    }[];
}

export default function DashboardPage() {
    const router = useRouter();
    // Dodajemy stan, aby wiedzieć, czy możemy próbować pobierać dane
    const [canFetch, setCanFetch] = useState(false);

    // Ten hook uruchomi się tylko raz, po załadowaniu komponentu w przeglądarce
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            // Jeśli nie ma tokenu, przekierowujemy OD RAZU
            router.push('/login');
        } else {
            // Jeśli token jest, pozwalamy na pobieranie danych
            setCanFetch(true);
        }
    }, [router]);


    const getSummary = async (): Promise<DashboardSummary> => {
        const token = localStorage.getItem('access_token');
        // Ten warunek jest teraz dodatkowym zabezpieczeniem
        if (!token) throw new Error('Brak tokenu.');

        const res = await fetch('http://localhost:4000/dashboard/summary', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 401) {
            // Jeśli token wygasł lub jest niepoprawny
            router.push('/login');
            throw new Error('Sesja wygasła.');
        }
        if (!res.ok) {
            throw new Error('Nie udało się pobrać danych.');
        }
        return res.json();
    };

    // Dodajemy nową opcję `enabled: canFetch`.
    // Zapytanie uruchomi się tylko wtedy, gdy `canFetch` jest `true`.
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: getSummary,
        enabled: canFetch, // <-- KLUCZOWA ZMIANA
    });

    // Jeśli weryfikujemy token i jeszcze nie pozwalamy na pobieranie,
    // lub jeśli dane się ładują, pokazujemy komunikat.
    if (!canFetch || isLoading) {
        return <div className="p-8">Ładowanie danych...</div>;
    }

    // Obsługa błędu pozostaje, na wypadek problemów z siecią itp.
    if (isError) {
        return <div className="p-8">Wystąpił błąd: {error.message}</div>;
    }

    // Renderowanie danych, gdy wszystko się udało
    return (
        <div className="p-8">
            <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
            {/* ... reszta kodu do wyświetlania danych pozostaje bez zmian ... */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Saldo Portfela</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{data.balance} PLN</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Eko Punkty</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{data.ekoPoints} 🌱</p>
                    </CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Twoje Usługi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul>
                            {data.services.map((service) => (
                                <li key={service.id} className="flex justify-between border-b py-2">
                                    <span>{service.name} ({service.plan.name})</span>
                                    <span className="font-semibold">{service.status}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}