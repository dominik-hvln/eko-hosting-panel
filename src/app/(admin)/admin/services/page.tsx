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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ServiceForm, formSchema, type FormValues } from './ServiceForm';
import { BillingCycle } from '@/common/enums/billing-cycle.enum';
import { ServiceStatus } from '@/common/enums/service-status.enum';

interface Service {
    id: string;
    name: string;
    status: ServiceStatus;
    autoRenew: boolean;
    expiresAt: string | null;
    billingCycle: BillingCycle;
    user: { id: string; email: string };
    plan: { id: string; name: string };
}
interface User { id: string; email: string; }
interface Plan { id: string; name: string; }

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default', suspended: 'destructive', cancelled: 'outline',
};

export default function AdminServicesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const queryClient = useQueryClient();
    const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

    useEffect(() => {
        const isEditing = !!editingService;
        if (isEditing) {
            // --- POPRAWKA TUTAJ: Resetujemy WSZYSTKIE pola, nawet te nieedytowalne ---
            form.reset({
                name: editingService.name,
                userId: editingService.user.id,
                planId: editingService.plan.id,
                billingCycle: editingService.billingCycle,
                status: editingService.status,
                autoRenew: editingService.autoRenew,
                expiresAt: editingService.expiresAt ? new Date(editingService.expiresAt) : undefined,
            });
        } else {
            // Kompletny reset dla trybu TWORZENIA
            form.reset({
                name: `Nowa usługa #${Math.floor(Math.random() * 1000)}`,
                userId: undefined,
                planId: undefined,
                billingCycle: BillingCycle.MONTHLY,
                expiresAt: undefined,
                status: ServiceStatus.ACTIVE,
                autoRenew: true,
            });
        }
    }, [editingService, isDialogOpen, form]);

    const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({ queryKey: ['admin-services'], queryFn: () => apiClient.get('/services') });
    const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({ queryKey: ['admin-users-list'], queryFn: () => apiClient.get('/users') });
    const { data: plans, isLoading: isLoadingPlans } = useQuery<Plan[]>({ queryKey: ['admin-plans-list'], queryFn: () => apiClient.get('/plans') });

    const onMutationSuccess = (message: string) => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); toast.success(message); setIsDialogOpen(false); setEditingService(null); };
    const onMutationError = (error: Error) => { toast.error(`Błąd: ${error.message}`); };

    const createMutation = useMutation({ mutationFn: (data: FormValues) => apiClient.post('/services', data), onSuccess: () => onMutationSuccess('Usługa pomyślnie utworzona!'), onError: onMutationError });
    const updateMutation = useMutation({ mutationFn: (vars: { id: string; data: Partial<FormValues> }) => apiClient.patch(`/services/${vars.id}`, vars.data), onSuccess: () => onMutationSuccess('Usługa pomyślnie zaktualizowana!'), onError: onMutationError });
    const deleteMutation = useMutation({ mutationFn: (id: string) => apiClient.delete(`/services/${id}`), onSuccess: () => onMutationSuccess('Usługa pomyślnie usunięta!'), onError: onMutationError });

    const handleFormSubmit = (values: FormValues) => {
        if (editingService) {
            updateMutation.mutate({ id: editingService.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const isLoading = isLoadingServices || isLoadingUsers || isLoadingPlans;
    if (isLoading) return <div className="p-8">Ładowanie danych...</div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Usługami</h1>
                <Button onClick={() => { setEditingService(null); setIsDialogOpen(true); }}>Dodaj nową usługę</Button>
            </div>
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Wszystkie Usługi w Systemie</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Nazwa Usługi</TableHead><TableHead>Klient</TableHead><TableHead>Status</TableHead><TableHead>Wygasa</TableHead><TableHead className="text-right">Akcje</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {services?.map((service) => (
                                <TableRow key={service.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{service.name}</TableCell>
                                    <TableCell>{service.user.email}</TableCell>
                                    <TableCell><Badge variant={statusVariantMap[service.status]}>{service.status}</Badge></TableCell>
                                    <TableCell>{service.expiresAt ? new Date(service.expiresAt).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { setEditingService(service); setIsDialogOpen(true); }}>Edytuj</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">Usuń</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Czy jesteś pewien?</AlertDialogTitle><AlertDialogDescription>Tej operacji nie można cofnąć.</AlertDialogDescription></AlertDialogHeader>
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
            <Dialog open={isDialogOpen || !!editingService} onOpenChange={(isOpen) => { if (!isOpen) { setEditingService(null); setIsDialogOpen(false); }}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingService ? `Edytuj Usługę` : 'Nowa Usługa'}</DialogTitle>
                        <DialogDescription>Zarządzaj usługą w systemie.</DialogDescription>
                    </DialogHeader>
                    <ServiceForm form={form} onSubmit={handleFormSubmit} isPending={createMutation.isPending || updateMutation.isPending} users={users || []} plans={plans || []} initialData={editingService || undefined} />
                </DialogContent>
            </Dialog>
        </div>
    );
}