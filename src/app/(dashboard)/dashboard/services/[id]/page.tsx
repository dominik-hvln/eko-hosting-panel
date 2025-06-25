'use client';

import { apiClient } from '@/lib/api-helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { CreditCard, Repeat, Loader2, CheckCircle } from 'lucide-react';

// Rozszerzamy interfejs o nowe pole
interface ServiceDetails {
    id: string;
    name: string;
    status: string;
    expiresAt: string | null;
    autoRenew: boolean;
    stripeSubscriptionId: string | null; // ID subskrypcji ze Stripe
    plan: {
        name: string;
        price: string;
        yearlyPrice: string | null;
        cpuLimit: number;
        ramLimit: number;
        diskSpaceLimit: number;
    };
}

export default function ServiceDetailsPage() {
    const params = useParams();
    const serviceId = params.id as string;
    const queryClient = useQueryClient();

    const {
        data: service,
        isLoading,
        isError,
    } = useQuery<ServiceDetails>({
        queryKey: ['service-details', serviceId],
        queryFn: () => apiClient.get(`/services/my-services/${serviceId}`),
        enabled: !!serviceId,
    });

    const toggleRenewMutation = useMutation({
        mutationFn: () => apiClient.patch(`/services/my-services/${serviceId}/toggle-renew`, {}),
        onSuccess: () => {
            toast.success('Ustawienia automatycznego odnawiania zostały zmienione.');
            queryClient.invalidateQueries({ queryKey: ['service-details', serviceId] });
        },
        onError: (error: Error) => toast.error(`Błąd: ${error.message}`),
    });

    const renewalMutation = useMutation({
        mutationFn: () => apiClient.post(`/payments/service-renewal/${serviceId}`, {}),
        onSuccess: (data: { paymentUrl: string }) => {
            toast.success('Przekierowywanie do strony płatności...');
            window.location.href = data.paymentUrl;
        },
        onError: (error: Error) => toast.error(`Błąd: ${error.message}`),
    });

    const subscribeMutation = useMutation({
        mutationFn: () => apiClient.post(`/payments/create-subscription/${serviceId}`, {}),
        onSuccess: (data: { paymentUrl: string }) => {
            toast.success('Przekierowywanie do strony płatności subskrypcji...');
            window.location.href = data.paymentUrl;
        },
        onError: (error: Error) => toast.error(`Błąd subskrypcji: ${error.message}`),
    });


    if (!serviceId || isLoading) return <div className="p-8">Ładowanie danych usługi...</div>;
    if (isError) return <div className="p-8">Wystąpił błąd lub nie masz dostępu do tej usługi.</div>;
    if (!service) return <div className="p-8">Nie znaleziono usługi.</div>;

    const hasActiveSubscription = !!service.stripeSubscriptionId;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{service.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <Badge>{service.status.toUpperCase()}</Badge>
                    <span className="text-sm text-muted-foreground">
                        Plan: {service.plan.name}
                    </span>
                    {hasActiveSubscription && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Subskrypcja aktywna
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Zarządzanie Usługą</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Wygasa dnia</p>
                                <p className="font-medium">
                                    {service.expiresAt ? new Date(service.expiresAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <Separator />
                        {hasActiveSubscription ? (
                            // Jeśli jest aktywna subskrypcja, pokaż informację
                            <div className="p-4 bg-secondary rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                    <div>
                                        <h4 className="font-semibold">Subskrypcja jest aktywna</h4>
                                        <p className="text-sm text-muted-foreground">Ta usługa odnawia się automatycznie za pomocą połączonej metody płatności.</p>
                                    </div>
                                </div>
                                {/* TODO: W przyszłości zintegrować Stripe Billing Portal */}
                                <Button className="w-full mt-4" disabled>Zarządzaj Subskrypcją (Wkrótce)</Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold">Automatyczne odnawianie z portfela</h4>
                                        <p className="text-xs text-muted-foreground">Użyj środków z portfela do odnowienia usługi.</p>
                                    </div>
                                    <Switch
                                        checked={service.autoRenew}
                                        onCheckedChange={() => toggleRenewMutation.mutate()}
                                        disabled={toggleRenewMutation.isPending}
                                    />
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">Odnów usługę jednorazowo</p>
                                    <Button onClick={() => renewalMutation.mutate()} disabled={renewalMutation.isPending} variant="outline">
                                        {renewalMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Repeat className="mr-2 h-4 w-4" />}
                                        Zapłać
                                    </Button>
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold">Przejdź na subskrypcję</h4>
                                            <p className="text-xs text-muted-foreground">"Ustaw i zapomnij". Płać cyklicznie kartą.</p>
                                        </div>
                                        <Button onClick={() => subscribeMutation.mutate()} disabled={subscribeMutation.isPending}>
                                            {subscribeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                                            Zasubskrybuj
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Parametry Planu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between"><span className="text-muted-foreground">Cena miesięczna</span><span className="font-medium">{service.plan.price} PLN</span></div>
                        <Separator />
                        <div className="flex justify-between"><span className="text-muted-foreground">Cena roczna</span><span className="font-medium">{service.plan.yearlyPrice || 'N/A'} PLN</span></div>
                        <Separator />
                        <div className="flex justify-between"><span className="text-muted-foreground">RAM</span><span className="font-medium">{service.plan.ramLimit} MB</span></div>
                        <Separator />
                        <div className="flex justify-between"><span className="text-muted-foreground">CPU</span><span className="font-medium">{service.plan.cpuLimit} %</span></div>
                        <Separator />
                        <div className="flex justify-between"><span className="text-muted-foreground">Dysk</span><span className="font-medium">{service.plan.diskSpaceLimit} MB</span></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}