'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

interface Message {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        email: string;
        role: string;
    };
}
interface TicketDetails {
    id: string;
    subject: string;
    status: string;
    messages: Message[];
}

const API_URL = 'http://localhost:4000';

const fetchTicketDetails = async (ticketId: string): Promise<TicketDetails> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Brak tokenu.');

    // Ta linia musi mieć grawisy ` `
    const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        // Rzucamy błąd ze statusem, aby 'retry' mogło go odczytać
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return response.json();
};

export default function TicketDetailsPage() {
    const params = useParams();
    const ticketId = params.id as string;

    const {
        data: ticket,
        isLoading,
        isError,
    } = useQuery<TicketDetails>({
        queryKey: ['ticket-details', ticketId],
        queryFn: () => fetchTicketDetails(ticketId),
        retry: (failureCount, error: any) => {
            // Poprawiona logika retry
            if (error.message.includes('404')) return false;
            return failureCount < 3;
        },
    });

    // GŁÓWNA POPRAWKA BŁĘDU 'undefined is not an object':
    // Sprawdzamy, czy dane są ładowane LUB czy obiekt 'ticket' jeszcze nie istnieje.
    if (isLoading) return <div>Ładowanie konwersacji...</div>;

    if (isError) return <div>Wystąpił błąd lub nie masz dostępu do tego zgłoszenia.</div>;

    // Ta dodatkowa garda jest kluczowa, aby uniknąć błędu renderowania
    if (!ticket) {
        return <div>Nie znaleziono danych dla tego zgłoszenia.</div>;
    }

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
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">
                                    {message.author.email}
                                    {message.author.role !== 'user' && <Badge className="ml-2">Support</Badge>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {new Date(message.createdAt).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Twoja odpowiedź</h2>
                <div className="p-8 border rounded-md bg-gray-200">FORMULARZ ODPOWIEDZI WKRÓTCE</div>
            </div>
        </div>
    );
}