'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

// Definiujemy typy dla danych
interface ServiceDetails {
    id: string;
    name: string;
    status: string;
    expiresAt: string | null;
    autoRenew: boolean;
    plan: {
        name: string;
        price: string;
        cpuLimit: number;
        ramLimit: number;
        diskSpaceLimit: number;
    };
}

const API_URL = 'http://localhost:4000';
const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('access_token')}` });

const fetchServiceDetails = async (serviceId: string): Promise<ServiceDetails> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Brak tokenu.');

    const response = await fetch(`${API_URL}/services/my-services/${serviceId}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Nie udało się pobrać szczegółów usługi.');
    return response.json();
};

export default function ServiceDetailsPage() {
    const params = useParams();
    const serviceId = params.id as string;

    const { data: service, isLoading, isError } = useQuery<ServiceDetails>({
        queryKey: ['service-details', serviceId],
        queryFn: () => fetchServiceDetails(serviceId),
        enabled: !!serviceId, // Uruchom zapytanie tylko, gdy mamy ID z URL
    });

    if (isLoading) return <div>Ładowanie danych usługi...</div>;
    if (isError) return <div>Wystąpił błąd lub nie masz dostępu do tej usługi.</div>;
    if (!service) return <div>Nie znaleziono usługi.</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{service.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <Badge>{service.status.toUpperCase()}</Badge>
                    <span className="text-sm text-muted-foreground">
            Plan: {service.plan.name}
          </span>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Informacje o Usłudze</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Automatyczne odnawianie</span>
                        <span className="font-medium">{service.autoRenew ? 'Włączone' : 'Wyłączone'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Wygasa dnia</span>
                        <span className="font-medium">
              {service.expiresAt ? new Date(service.expiresAt).toLocaleDateString() : 'N/A'}
            </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Parametry Planu</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between"><span className="text-muted-foreground">Cena</span><span className="font-medium">{service.plan.price} PLN / msc</span></div>
                    <Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">RAM</span><span className="font-medium">{service.plan.ramLimit} MB</span></div>
                    <Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">CPU</span><span className="font-medium">{service.plan.cpuLimit} %</span></div>
                    <Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Dysk</span><span className="font-medium">{service.plan.diskSpaceLimit} MB</span></div>
                </CardContent>
            </Card>
        </div>
    );
}