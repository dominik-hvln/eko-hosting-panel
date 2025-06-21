'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { PlanForm } from './PlanForm';
import toast from 'react-hot-toast';

interface Plan {
    id: string;
    name: string;
    price: string;
    cpuLimit: number;
    ramLimit: number;
    diskSpaceLimit: number;
    monthlyTransferLimit: number;
    isPublic: boolean;
}

const API_URL = 'http://localhost:4000';

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
    // Obsługa błędów pozostaje bez zmian
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: 'Nieznany błąd serwera',
        }));
        throw new Error(errorData.message || 'Wystąpił błąd API');
    }

    if (response.status === 204) {
        return;
    }

    return response.json();
};

const fetchAdminPlans = (): Promise<Plan[]> =>
    fetch(`${API_URL}/plans`, { headers: getAuthHeader() }).then(handleResponse);

const createPlan = (newPlanData: any): Promise<Plan> =>
    fetch(`${API_URL}/plans`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlanData),
    }).then(handleResponse);

const updatePlan = ({ id, data }: { id: string; data: any }): Promise<Plan> =>
    fetch(`${API_URL}/plans/${id}`, {
        method: 'PATCH',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);

const deletePlan = (id: string): Promise<void> =>
    fetch(`${API_URL}/plans/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(), 'Content-Type': 'application/json',
    }).then(handleResponse);


export default function AdminPlansPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);
    const queryClient = useQueryClient();

    const { data: plans, isLoading, isError } = useQuery<Plan[]>({
        queryKey: ['admin-plans'],
        queryFn: fetchAdminPlans,
    });

    const onMutationSuccess = (message: string) => {
        queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
        toast.success(message);
    };

    const onMutationError = (error: Error) => {
        toast.error(`Wystąpił błąd: ${error.message}`);
    };

    const createMutation = useMutation({ mutationFn: createPlan, onSuccess: () => { onMutationSuccess('Plan pomyślnie utworzony!'); setIsCreateDialogOpen(false); }, onError: onMutationError });
    const updateMutation = useMutation({ mutationFn: updatePlan, onSuccess: () => { onMutationSuccess('Plan pomyślnie zaktualizowany!'); setPlanToEdit(null); }, onError: onMutationError });
    const deleteMutation = useMutation({ mutationFn: deletePlan, onSuccess: () => onMutationSuccess('Plan pomyślnie usunięty!'), onError: onMutationError });

    if (isLoading) return <div>Ładowanie planów...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania danych.</div>;

    const handleFormSubmit = (values: any) => {
        if (planToEdit) {
            updateMutation.mutate({ id: planToEdit.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const isMutationPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Planami</h1>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Dodaj nowy plan</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nowy Plan</DialogTitle>
                        </DialogHeader>
                        <PlanForm onSubmit={handleFormSubmit} isPending={isMutationPending} />
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista Planów Hostingowych</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nazwa</TableHead>
                                <TableHead>Cena (PLN)</TableHead>
                                <TableHead>Publiczny</TableHead>
                                <TableHead className="text-right">Akcje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans?.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium">{plan.name}</TableCell>
                                    <TableCell>{plan.price}</TableCell>
                                    <TableCell>{plan.isPublic ? 'Tak' : 'Nie'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setPlanToEdit(plan)}>Edytuj</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">Usuń</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Czy na pewno chcesz usunąć ten plan?</AlertDialogTitle>
                                                            <AlertDialogDescription>Tej akcji nie można cofnąć.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteMutation.mutate(plan.id)} className="bg-red-600 hover:bg-red-700">
                                                                Usuń na stałe
                                                            </AlertDialogAction>
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

            <Dialog open={!!planToEdit} onOpenChange={(isOpen) => !isOpen && setPlanToEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edytuj Plan: {planToEdit?.name}</DialogTitle>
                    </DialogHeader>
                    <PlanForm
                        initialData={planToEdit!}
                        isPending={isMutationPending}
                        onSubmit={handleFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}