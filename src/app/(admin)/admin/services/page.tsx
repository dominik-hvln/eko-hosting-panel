'use client';

import { apiClient } from '@/lib/api-helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Service {
    id: string;
    name: string;
    status: string;
    autoRenew: boolean;
    expiresAt: string | null;
    user: { email: string };
    plan: { name: string };
}

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    suspended: 'destructive',
    cancelled: 'outline',
};

export default function AdminServicesPage() {
    const router = useRouter();
    const { data: services, isLoading, isError } = useQuery<Service[]>({
        queryKey: ['admin-services'],
        queryFn: () => apiClient.get('/services'), // Używamy endpointu admina
    });

    if (isLoading) return <div className="p-8">Ładowanie usług...</div>;
    if (isError) return <div className="p-8">Wystąpił błąd podczas pobierania danych.</div>;

    const handleImpersonateAndGo = (userId: string, serviceId: string) => {
        // Ta funkcja w przyszłości mogłaby wywoływać impersonację
        // Na razie po prostu przekierowujemy do widoku klienta
        router.push(`/dashboard/services/${serviceId}`);
    };

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Usługami</h1>
            </div>
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Wszystkie Usługi w Systemie</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nazwa Usługi</TableHead>
                                <TableHead>Klient</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Auto-odnawianie</TableHead>
                                <TableHead>Wygasa</TableHead>
                                <TableHead className="text-right">Akcje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services?.map((service) => (
                                <TableRow key={service.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{service.name}</TableCell>
                                    <TableCell>{service.user.email}</TableCell>
                                    <TableCell>{service.plan.name}</TableCell>
                                    <TableCell><Badge variant={statusVariantMap[service.status]}>{service.status}</Badge></TableCell>
                                    <TableCell>{service.autoRenew ? 'Tak' : 'Nie'}</TableCell>
                                    <TableCell>{service.expiresAt ? new Date(service.expiresAt).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {/* W przyszłości ta akcja będzie połączona z impersonacją */}
                                                <DropdownMenuItem onClick={() => alert('Do zaimplementowania: edycja usługi')}>Edytuj</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">Zawieś</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}