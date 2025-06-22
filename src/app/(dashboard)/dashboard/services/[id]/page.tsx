'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface ServiceDetails {
    id: string; name: string; status: string; expiresAt: string | null; autoRenew: boolean;
    plan: { name: string; price: string; cpuLimit: number; ramLimit: number; diskSpaceLimit: number; };
}

const API_URL = 'http://localhost:4000';
const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('access_token')}` });
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Nieznany błąd serwera' }));
        throw new Error(errorData.message || 'Wystąpił błąd API');
    }
    if (response.status === 204) { return; }
    return response.json();
};

const fetchServiceDetails = (serviceId: string): Promise<ServiceDetails> =>
    fetch(`${API_URL}/services/my-services/${serviceId}`, { headers: getAuthHeader() }).then(handleResponse);

const toggleAutoRenew = (serviceId: string): Promise<ServiceDetails> =>
    fetch(`${API_URL}/services/my-services/${serviceId}/toggle-renew`, { method: 'PATCH', headers: getAuthHeader() }).then(handleResponse);


export default function ServiceDetailsPage() {
    // Krok 1: Wywołujemy WSZYSTKIE haki na samej górze, bezwarunkowo.
    const params = useParams();
    const queryClient = useQueryClient();
    const serviceId = params.id as string;

    const { data: service, isLoading, isError } = useQuery<ServiceDetails>({
        queryKey: ['service-details', serviceId],
        queryFn: () => fetchServiceDetails(serviceId),
        // Używamy opcji `enabled`, aby zapytanie uruchomiło się tylko, gdy mamy serviceId.
        // To jest poprawny sposób na warunkowe pobieranie danych.
        enabled: !!serviceId,
    });

    const toggleRenewMutation = useMutation({
        mutationFn: () => toggleAutoRenew(serviceId),
        onSuccess: () => {
            toast.success('Ustawienia automatycznego odnawiania zostały zmienione.');
            queryClient.invalidateQueries({ queryKey: ['service-details', serviceId] });
        },
        onError: (error: Error) => {
            toast.error(`Błąd: ${error.message}`);
        },
    });

    // Krok 2: Dopiero teraz, po wywołaniu wszystkich haków, możemy używać
    // logiki warunkowej i "early returns".
    if (isLoading || !serviceId) return <div>Ładowanie danych usługi...</div>;
    if (isError) return <div>Wystąpił błąd lub nie masz dostępu do tej usługi.</div>;
    if (!service) return <div>Nie znaleziono usługi.</div>;

    // Krok 3: Renderowanie widoku, gdy mamy już dane.
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
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Automatyczne odnawianie</span>
                        <Switch
                            checked={service.autoRenew}
                            onCheckedChange={() => toggleRenewMutation.mutate()}
                            disabled={toggleRenewMutation.isPending}
                        />
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