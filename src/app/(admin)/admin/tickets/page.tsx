'use client';

import { apiClient } from '@/lib/api-helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface Ticket { id: string; subject: string; status: string; priority: string; updatedAt: string; author: { email: string; }; }

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    open: 'secondary', in_progress: 'default', closed: 'outline',
};
const priorityVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    low: 'secondary', medium: 'outline', high: 'destructive',
};

export default function AdminTicketsPage() {
    const { data: tickets, isLoading, isError, } = useQuery<Ticket[]>({
        queryKey: ['admin-tickets'],
        queryFn: () => apiClient.get('/tickets/admin/all'),
    });

    if (isLoading) return <div>Ładowanie zgłoszeń...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania danych.</div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Zgłoszeniami</h1>
            </div>
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Wszystkie Zgłoszenia</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Temat</TableHead><TableHead>Autor</TableHead><TableHead>Status</TableHead><TableHead>Priorytet</TableHead><TableHead>Ostatnia Aktualizacja</TableHead><TableHead className="text-right">Akcje</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {tickets?.map((ticket) => (
                                <TableRow key={ticket.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                                    <TableCell>{ticket.author.email}</TableCell>
                                    <TableCell><Badge variant={statusVariantMap[ticket.status]}>{ticket.status}</Badge></TableCell>
                                    <TableCell><Badge variant={priorityVariantMap[ticket.priority]}>{ticket.priority}</Badge></TableCell>
                                    <TableCell>{new Date(ticket.updatedAt).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href={`/admin/tickets/${ticket.id}`}><DropdownMenuItem>Zobacz</DropdownMenuItem></Link>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}