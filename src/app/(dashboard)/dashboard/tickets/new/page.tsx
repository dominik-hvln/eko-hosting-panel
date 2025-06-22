'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
// Importujemy formularz ORAZ nasz wyeksportowany typ
import { NewTicketForm, type CreateTicketValues } from './NewTicketForm';

const API_URL = 'http://localhost:4000';

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się stworzyć zgłoszenia.');
    }
    return response.json();
};

const createTicket = async (data: CreateTicketValues) => {
    const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export default function NewTicketPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createTicket,
        onSuccess: (data) => {
            toast.success('Zgłoszenie zostało pomyślnie utworzone!');
            // Odświeżamy listę ticketów, aby nowy był widoczny po powrocie
            queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
            // Przekierowujemy użytkownika na stronę nowo utworzonego ticketa
            router.push(`/dashboard/tickets/${data.id}`);
        },
        onError: (error: Error) => {
            toast.error(`Błąd: ${error.message}`);
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Nowe Zgłoszenie Supportowe</h1>
                <p className="text-muted-foreground">
                    Opisz swój problem, a my postaramy się pomóc jak najszybciej.
                </p>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <NewTicketForm
                        onSubmit={mutation.mutate}
                        isPending={mutation.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    );
}