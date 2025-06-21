'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ReplyForm } from './ReplyForm'; // Importujemy nasz nowy formularz
import toast from 'react-hot-toast';

interface Message { id: string; content: string; createdAt: string; author: { id: string; email: string; role: string; };}
interface TicketDetails { id: string; subject: string; status: string; messages: Message[]; }
const API_URL = 'http://localhost:4000';

const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('access_token')}` });

const fetchTicketDetails = async (ticketId: string): Promise<TicketDetails> => {
    // ... funkcja fetchTicketDetails bez zmian ...
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Brak tokenu.');
    const response = await fetch(`${API_URL}/tickets/${ticketId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('Nie udało się pobrać szczegółów zgłoszenia.');
    return response.json();
};

// --- NOWA FUNKCJA DO WYSYŁANIA ODPOWIEDZI ---
const postTicketReply = async ({ ticketId, content }: { ticketId: string; content: string }) => {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się wysłać odpowiedzi.');
    }
    return response.json();
};


export default function TicketDetailsPage() {
    const params = useParams();
    const ticketId = params.id as string;
    const queryClient = useQueryClient();

    const { data: ticket, isLoading, isError } = useQuery<TicketDetails>({
        queryKey: ['ticket-details', ticketId],
        queryFn: () => fetchTicketDetails(ticketId),
    });

    // --- NOWA MUTACJA DO WYSYŁANIA WIADOMOŚCI ---
    const replyMutation = useMutation({
        mutationFn: postTicketReply,
        onSuccess: () => {
            toast.success('Odpowiedź została wysłana!');
            // Unieważniamy zapytanie o szczegóły tego ticketa,
            // co spowoduje automatyczne pobranie świeżej listy wiadomości.
            queryClient.invalidateQueries({ queryKey: ['ticket-details', ticketId] });
        },
        onError: (error) => {
            toast.error(`Błąd: ${error.message}`);
        },
    });

    if (isLoading) return <div>Ładowanie konwersacji...</div>;
    if (isError) return <div>Wystąpił błąd lub nie masz dostępu do tego zgłoszenia.</div>;
    if (!ticket) return <div>Nie znaleziono danych dla tego zgłoszenia.</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{ticket.subject}</h1>
                <Badge className="mt-2">{ticket.status.toUpperCase()}</Badge>
            </div>

            <div className="space-y-4">
                {ticket.messages
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((message) => (
                        <Card key={message.id}>
                            <CardHeader className="flex flex-row justify-between items-center pb-2">
                                <CardTitle className="text-sm font-semibold">
                                    {message.author.email}
                                </CardTitle>
                                {message.author.role !== 'user' && (
                                    <Badge variant="secondary">Support</Badge>
                                )}
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs text-gray-500 mt-4 text-right">
                                    {new Date(message.createdAt).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Twoja odpowiedź</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ReplyForm
                            onSubmit={(values) =>
                                replyMutation.mutate({ ticketId, content: values.content })
                            }
                            isPending={replyMutation.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}