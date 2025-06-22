'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

// Definiujemy typy dla danych
interface Ticket {
    id: string;
    subject: string;
    status: string;
    updatedAt: string;
}

const API_URL = 'http://localhost:4000';

const fetchMyTickets = async (): Promise<Ticket[]> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Brak tokenu.');

    const response = await fetch(`${API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Nie udało się pobrać zgłoszeń.');
    return response.json();
};

export default function UserTicketsPage() {
    const { data: tickets, isLoading, isError } = useQuery<Ticket[]>({
        queryKey: ['my-tickets'],
        queryFn: fetchMyTickets,
    });

    if (isLoading) return <div>Ładowanie zgłoszeń...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania zgłoszeń.</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Twoje Zgłoszenia Supportowe</h1>
                <Button asChild>
                    <Link href="/dashboard/tickets/new">Otwórz nowe zgłoszenie</Link>
                </Button>
            </div>
            <div className="space-y-4">
                {tickets?.length === 0 && <p>Nie masz jeszcze żadnych zgłoszeń.</p>}
                {tickets?.map((ticket) => (
                    <Link href={`/dashboard/tickets/${ticket.id}`} key={ticket.id}>
                        <Card className="hover:bg-gray-50 cursor-pointer mb-4">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{ticket.subject}</span>
                                    <Badge>{ticket.status.toUpperCase()}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    Ostatnia aktualizacja: {new Date(ticket.updatedAt).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}