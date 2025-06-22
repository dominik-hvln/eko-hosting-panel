'use client';

import { apiClient } from '@/lib/api-helpers';
import { Card, CardContent } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { NewTicketForm, type CreateTicketValues } from './NewTicketForm';

export default function NewTicketPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: CreateTicketValues) => apiClient.post('/tickets', data),
        onSuccess: (data: any) => {
            toast.success('Zgłoszenie zostało pomyślnie utworzone!');
            queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
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