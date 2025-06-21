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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { PlanForm } from './PlanForm';
import { z } from 'zod';

// Typy i funkcje pomocnicze, teraz lokalne dla tego pliku
interface Plan {
    id: string;
    name: string;
    price: string;
    ramLimit: number;
    diskSpaceLimit: number;
    isPublic: boolean;
}

const API_URL = 'http://localhost:4000'; // Używamy stałej zamiast .env

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
};

const fetchAdminPlans = async (): Promise<Plan[]> => {
    const response = await fetch(`${API_URL}/plans`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Nie udało się pobrać planów.');
    return response.json();
};

// Funkcja do wysyłania danych nowego planu
const createPlan = async (newPlanData: any): Promise<Plan> => {
    const response = await fetch(`${API_URL}/plans`, {
        method: 'POST',
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlanData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się stworzyć planu.');
    }
    return response.json();
}


export default function AdminPlansPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const {
        data: plans,
        isLoading,
        isError,
    } = useQuery<Plan[]>({
        queryKey: ['admin-plans'],
        queryFn: fetchAdminPlans,
    });

    // Logika mutacji (tworzenia nowego planu)
    const { mutate, isPending } = useMutation({
        mutationFn: createPlan, // Używamy naszej nowej, lokalnej funkcji
        onSuccess: () => {
            console.log('Plan stworzony pomyślnie! Odświeżam listę...');
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            setIsDialogOpen(false);
        },
        onError: (error) => {
            alert(`Wystąpił błąd: ${error.message}`);
        },
    });

    if (isLoading) return <div>Ładowanie planów...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania danych.</div>;

    // Zdefiniowanie typu dla `onSubmit` z naszego formularza
    const handleFormSubmit = (values: z.infer<any>) => {
        mutate(values);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Planami</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Dodaj nowy plan</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nowy Plan Hostingowy</DialogTitle>
                            <DialogDescription>
                                Wypełnij poniższe pola, aby stworzyć nowy plan.
                            </DialogDescription>
                        </DialogHeader>
                        <PlanForm onSubmit={handleFormSubmit} isPending={isPending} />
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
                                <TableHead>RAM (MB)</TableHead>
                                <TableHead>Dysk (MB)</TableHead>
                                <TableHead>Publiczny</TableHead>
                                <TableHead className="text-right">Akcje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans?.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium">{plan.name}</TableCell>
                                    <TableCell>{plan.price}</TableCell>
                                    <TableCell>{plan.ramLimit}</TableCell>
                                    <TableCell>{plan.diskSpaceLimit}</TableCell>
                                    <TableCell>{plan.isPublic ? 'Tak' : 'Nie'}</TableCell>
                                    <TableCell className="text-right"></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}