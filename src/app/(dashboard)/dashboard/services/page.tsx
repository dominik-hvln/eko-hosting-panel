'use client';

import { apiClient } from '@/lib/api-helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface Service {
    id: string;
    name: string;
    status: string;
    plan: {
        name: string;
    };
    expiresAt: string | null;
}

export default function UserServicesPage() {
    const { data: services, isLoading, isError } = useQuery<Service[]>({
        queryKey: ['my-services'],
        queryFn: () => apiClient.get('/services/my-services'),
    });

    if (isLoading) return <div>Ładowanie Twoich usług...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania usług.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Twoje Usługi</h1>
                <Button>Zamów nową usługę</Button>
            </div>
            <div className="space-y-4">
                {services?.length === 0 && (
                    <p className="text-muted-foreground">Nie posiadasz jeszcze żadnych usług.</p>
                )}
                {services?.map((service) => (
                    <Link href={`/dashboard/services/${service.id}`} key={service.id}>
                        <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{service.name} <span className="text-muted-foreground font-normal">({service.plan.name})</span></span>
                                    <Badge>{service.status.toUpperCase()}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Wygasa: {service.expiresAt ? new Date(service.expiresAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}