'use client';

import { apiClient } from '@/lib/api-helpers';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlanForm, formSchema, type FormValues } from './PlanForm'; // Importujemy formularz, schemat i typ

interface Plan { id: string; name: string; price: string; isPublic: boolean; cpuLimit: number; ramLimit: number; diskSpaceLimit: number; monthlyTransferLimit: number; }

export default function AdminPlansPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', price: 0, isPublic: true, cpuLimit: 100, ramLimit: 1024, diskSpaceLimit: 10240, monthlyTransferLimit: 1000 },
    });

    useEffect(() => {
        if (editingPlan) {
            form.reset({ ...editingPlan, price: parseFloat(editingPlan.price) });
        } else {
            form.reset({ name: '', price: 0, isPublic: true, cpuLimit: 100, ramLimit: 1024, diskSpaceLimit: 10240, monthlyTransferLimit: 1000 });
        }
    }, [editingPlan, form]);

    const { data: plans, isLoading, isError } = useQuery<Plan[]>({ queryKey: ['admin-plans'], queryFn: () => apiClient.get('/plans') });
    const onMutationSuccess = (message: string) => { queryClient.invalidateQueries({ queryKey: ['admin-plans'] }); toast.success(message); setIsDialogOpen(false); setEditingPlan(null); };
    const onMutationError = (error: Error) => { toast.error(`Wystąpił błąd: ${error.message}`); };

    const createMutation = useMutation({ mutationFn: (data: FormValues) => apiClient.post('/plans', data), onSuccess: () => onMutationSuccess('Plan pomyślnie utworzony!'), onError: onMutationError });
    const updateMutation = useMutation({ mutationFn: (vars: { id: string; data: FormValues }) => apiClient.patch(`/plans/${vars.id}`, vars.data), onSuccess: () => onMutationSuccess('Plan pomyślnie zaktualizowany!'), onError: onMutationError });
    const deleteMutation = useMutation({ mutationFn: (id: string) => apiClient.delete(`/plans/${id}`), onSuccess: () => onMutationSuccess('Plan pomyślnie usunięty!'), onError: onMutationError });

    const handleFormSubmit = (values: FormValues) => {
        if (editingPlan) {
            updateMutation.mutate({ id: editingPlan.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    if (isLoading) return <div className="p-8">Ładowanie planów...</div>;
    if (isError) return <div className="p-8">Wystąpił błąd podczas pobierania danych.</div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Planami</h1>
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setEditingPlan(null); setIsDialogOpen(isOpen); }}>
                    <DialogTrigger asChild><Button onClick={() => setEditingPlan(null)}>Dodaj nowy plan</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Nowy Plan</DialogTitle><DialogDescription>Wypełnij pola, aby stworzyć plan.</DialogDescription></DialogHeader>
                        <PlanForm onSubmit={handleFormSubmit} isPending={isPending} form={form} />
                    </DialogContent>
                </Dialog>
            </div>
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Lista Planów Hostingowych</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Nazwa</TableHead><TableHead>Cena (PLN)</TableHead><TableHead>Publiczny</TableHead><TableHead className="text-right">Akcje</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {plans?.map((plan) => (
                                <TableRow key={plan.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{plan.name}</TableCell>
                                    <TableCell>{plan.price}</TableCell>
                                    <TableCell>{plan.isPublic ? 'Tak' : 'Nie'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { setEditingPlan(plan); setIsDialogOpen(true); }}>Edytuj</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">Usuń</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Czy na pewno chcesz usunąć ten plan?</AlertDialogTitle><AlertDialogDescription>Tej akcji nie można cofnąć.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteMutation.mutate(plan.id)} className="bg-red-600 hover:bg-red-700">Usuń na stałe</AlertDialogAction>
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

            {/* Ten dialog jest teraz kontrolowany przez logikę w przycisku Edytuj, nie potrzebujemy go duplikować */}
            {/* <Dialog open={!!editingPlan} ... /> */}
        </div>
    );
}