'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

// Definicja typu dla planu
interface Plan {
    id: string;
    name: string;
    price: string;
    ramLimit: number;
    diskSpaceLimit: number;
    isPublic: boolean;
}

// Funkcja pobierająca dane, umieszczona bezpośrednio tutaj
const fetchAdminPlans = async (): Promise<Plan[]> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('Brak tokenu autoryzacyjnego.');
    }

    // Używamy bezpośrednio adresu URL, omijając zmienną środowiskową
    const apiUrl = 'http://localhost:4000/plans';

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Nie udało się pobrać planów.');
    }
    return response.json();
};

export default function AdminPlansPage() {
    const { data, isLoading, isError } = useQuery<Plan[]>({
        queryKey: ['admin-plans'],
        queryFn: fetchAdminPlans, // Używamy naszej nowej, lokalnej funkcji
    });

    if (isLoading) return <div>Ładowanie planów...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania danych.</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Planami</h1>
                <Button>Dodaj nowy plan</Button>
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
                            {data?.map((plan) => (
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