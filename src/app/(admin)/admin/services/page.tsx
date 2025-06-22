'use client';

import { apiClient } from '@/lib/api-helpers';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ServiceForm, formSchema, type FormValues } from './ServiceForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Service {
    id: string;
    name: string;
    status: string;
    autoRenew: boolean;
    expiresAt: string | null;
    user: { id: string; email: string };
    plan: { name: string };
}

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    suspended: 'destructive',
    cancelled: 'outline',
};

export default function AdminServicesPage() {
    const [editingService, setEditingService] = useState<Service | null>(null);
    const queryClient = useQueryClient();
    const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

    useEffect(() => {
        if (editingService) {
            form.reset({ status: editingService.status, autoRenew: editingService.autoRenew });
        }
    }, [editingService, form]);

    const { data: services, isLoading, isError } = useQuery<Service[]>({
        queryKey: ['admin-services'],
        queryFn: () => apiClient.get('/services'),
    });

    // --- DODAJEMY BRAKUJĄCE FUNKCJE POMOCNICZE ---
    const onMutationSuccess = (message: string) => {
        queryClient.invalidateQueries({ queryKey: ['admin-services'] });
        toast.success(message);
        setEditingService(null);
    };
    const onMutationError = (error: Error) => {
        toast.error(`Wystąpił błąd: ${error.message}`);
    };

    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: FormValues }) => apiClient.patch(`/services/${vars.id}`, vars.data),
        onSuccess: () => onMutationSuccess('Usługa pomyślnie zaktualizowana!'),
        onError: onMutationError,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/services/${id}`),
        onSuccess: () => onMutationSuccess('Usługa pomyślnie usunięta!'),
        onError: onMutationError,
    });

    const handleFormSubmit = (values: FormValues) => {
        if (editingService) {
            updateMutation.mutate({ id: editingService.id, data: values });
        }
    };

    if (isLoading) return <div className="p-8">Ładowanie usług...</div>;
    if (isError) return <div className="p-8">Wystąpił błąd podczas pobierania danych.</div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Usługami</h1>
            </div>
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Wszystkie Usługi w Systemie</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Nazwa Usługi</TableHead><TableHead>Klient</TableHead><TableHead>Status</TableHead><TableHead>Auto-odnawianie</TableHead><TableHead>Wygasa</TableHead><TableHead className="text-right">Akcje</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {services?.map((service) => (
                                <TableRow key={service.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{service.name}</TableCell>
                                    <TableCell>{service.user.email}</TableCell>
                                    <TableCell><Badge variant={statusVariantMap[service.status]}>{service.status}</Badge></TableCell>
                                    <TableCell>{service.autoRenew ? 'Tak' : 'Nie'}</TableCell>
                                    <TableCell>{service.expiresAt ? new Date(service.expiresAt).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingService(service)}>Edytuj</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">Usuń</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Czy jesteś pewien?</AlertDialogTitle><AlertDialogDescription>Tej operacji nie można cofnąć. Usługa zostanie trwale usunięta.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteMutation.mutate(service.id)} className="bg-red-600 hover:bg-red-700">Usuń na stałe</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!editingService} onOpenChange={(isOpen) => { if (!isOpen) setEditingService(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edytuj Usługę</DialogTitle>
                        <DialogDescription>Zarządzaj usługą "{editingService?.name}" klienta {editingService?.user.email}.</DialogDescription>
                    </DialogHeader>
                    <ServiceForm form={form} onSubmit={handleFormSubmit} isPending={updateMutation.isPending} />
                </DialogContent>
            </Dialog>
        </div>
    );
}