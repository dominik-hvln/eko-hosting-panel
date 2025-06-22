'use client';

import { apiClient } from '@/lib/api-helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface Ticket {
    id: string;
    subject: string;
    status: string;
    updatedAt: string;
}

export default function UserTicketsPage() {
    const { data: tickets, isLoading, isError } = useQuery<Ticket[]>({
        queryKey: ['my-tickets'],
        queryFn: () => apiClient.get('/tickets'),
    });

    if (isLoading) return <div>Ładowanie zgłoszeń...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania zgłoszeń.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Twoje Zgłoszenia Supportowe</h1>
                <Button asChild>
                    <Link href="/dashboard/tickets/new">Otwórz nowe zgłoszenie</Link>
                </Button>
            </div>
            <div className="space-y-4">
                {tickets?.length === 0 && (
                    <p className="text-muted-foreground">Nie masz jeszcze żadnych zgłoszeń.</p>
                )}
                {tickets?.map((ticket) => (
                    <Link href={`/dashboard/tickets/${ticket.id}`} key={ticket.id}>
                        <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{ticket.subject}</span>
                                    <Badge>{ticket.status.toUpperCase()}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
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