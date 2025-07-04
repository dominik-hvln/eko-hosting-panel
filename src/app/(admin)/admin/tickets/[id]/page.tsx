'use client';

import { apiClient } from '@/lib/api-helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ReplyForm } from '@/components/tickets/ReplyForm'; // Importujemy nasz reużywalny formularz

interface Message { id: string; content: string; createdAt: string; author: { email: string; role: string; }; }
interface TicketDetails { id: string; subject: string; status: string; messages: Message[]; }

export default function AdminTicketDetailsPage() {
    const params = useParams();
    const ticketId = params.id as string;
    const queryClient = useQueryClient();

    const { data: ticket, isLoading, isError } = useQuery<TicketDetails>({
        queryKey: ['admin-ticket-details', ticketId],
        queryFn: () => apiClient.get(`/tickets/${ticketId}`),
        enabled: !!ticketId,
    });

    // Logika wysyłania odpowiedzi jest identyczna jak po stronie klienta
    const replyMutation = useMutation({
        mutationFn: (variables: { content: string }) =>
            apiClient.post(`/tickets/${ticketId}/messages`, { content: variables.content }),
        onSuccess: () => {
            toast.success('Odpowiedź została wysłana!');
            queryClient.invalidateQueries({ queryKey: ['admin-ticket-details', ticketId] });
        },
        onError: (error: Error) => {
            toast.error(`Błąd: ${error.message}`);
        },
    });

    if (isLoading) return <div>Ładowanie konwersacji...</div>;
    if (isError) return <div>Wystąpił błąd lub nie masz dostępu do tego zgłoszenia.</div>;
    if (!ticket) return <div>Nie znaleziono danych dla tego zgłoszenia.</div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{ticket.subject}</h1>
                <Badge className="mt-2">{ticket.status.toUpperCase()}</Badge>
            </div>
            <div className="space-y-4">
                {ticket.messages
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((message) => (
                        <Card key={message.id} className={message.author.role === 'user' ? '' : 'bg-secondary'}>
                            <CardHeader className="flex flex-row justify-between items-center pb-2">
                                <CardTitle className="text-sm font-semibold">{message.author.email}</CardTitle>
                                {message.author.role !== 'user' && (<Badge variant="default">Support</Badge>)}
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs text-muted-foreground mt-4 text-right">{new Date(message.createdAt).toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader><CardTitle className="text-xl">Odpowiedz jako Support</CardTitle></CardHeader>
                    <CardContent>
                        <ReplyForm
                            onSubmit={(values) => replyMutation.mutate(values)}
                            isPending={replyMutation.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}