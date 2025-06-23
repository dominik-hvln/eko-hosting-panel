'use client';

import { apiClient } from '@/lib/api-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardSummary {
    user: { firstName: string | null, email: string };
    balance: string;
    ekoPoints: number;
    services: { id: string; name: string; status: string; plan: { name: string; }; }[];
}

export default function DashboardPage() {
    const router = useRouter();
    const [canFetch, setCanFetch] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
        } else {
            setCanFetch(true);
        }
    }, [router]);

    const { data, isLoading, isError, error } = useQuery<DashboardSummary>({
        queryKey: ['dashboardSummary'],
        queryFn: () => apiClient.get('/dashboard/summary'),
        enabled: canFetch,
    });

    if (!canFetch || isLoading) {
        return <div className="p-8">Ładowanie danych...</div>;
    }
    if (isError) return <div>Wystąpił błąd: {error.message}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">
                Cześć, {data?.user.firstName || data?.user.email}!
            </h1>
            <p className="text-muted-foreground">Oto podsumowanie Twojego konta.</p>
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>Saldo Portfela</CardTitle></CardHeader>
                    <CardContent><p className="text-4xl font-bold">{data?.balance} PLN</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Eko Punkty</CardTitle></CardHeader>
                    <CardContent><p className="text-4xl font-bold">{data?.ekoPoints} 🌱</p></CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader><CardTitle>Twoje Usługi</CardTitle></CardHeader>
                    <CardContent>
                        <ul>
                            {data?.services.map((service) => (
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