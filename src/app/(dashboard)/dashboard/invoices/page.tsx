'use client';

import { apiClient } from '@/lib/api-helpers';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Invoice {
    id: string;
    invoiceNumber: string;
    issueDate: string;
    totalGrossValue: number;
}

export default function InvoicesPage() {
    const { data: invoices, isLoading, isError } = useQuery<Invoice[]>({
        queryKey: ['invoices'],
        queryFn: () => apiClient.get('/invoices'),
    });

    // Używamy mutacji do obsługi akcji pobierania, aby mieć stan ładowania
    const downloadMutation = useMutation({
        mutationFn: (invoice: Invoice) => apiClient.getBlob(`/invoices/${invoice.id}/pdf`),
        onSuccess: (blob, invoice) => {
            // Tworzymy tymczasowy link w pamięci przeglądarki
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Nadajemy plikowi nazwę
            a.download = `faktura-${invoice.invoiceNumber.replace(/\//g, '-')}.pdf`;
            document.body.appendChild(a);
            // Symulujemy kliknięcie, aby rozpocząć pobieranie
            a.click();
            // Sprzątamy po sobie
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Pobieranie faktury rozpoczęte.');
        },
        onError: () => {
            toast.error('Nie udało się pobrać faktury.');
        },
    });

    const formatCurrency = (amountInGr: number) => `${(amountInGr / 100).toFixed(2)} PLN`;

    if (isLoading) return <div>Ładowanie faktur...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania faktur.</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Faktury i Rozliczenia</h1>
                <p className="text-muted-foreground">Przeglądaj i pobieraj swoje dokumenty księgowe.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Twoje Faktury</CardTitle>
                    <CardDescription>Lista wszystkich faktur pro-forma wygenerowanych dla Twojego konta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>Numer Faktury</TableHead><TableHead>Data Wystawienia</TableHead><TableHead>Kwota Brutto</TableHead><TableHead className="text-right">Pobierz</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices?.length === 0 && ( <TableRow><TableCell colSpan={4} className="text-center h-24">Nie znaleziono żadnych faktur.</TableCell></TableRow> )}
                            {invoices?.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{formatCurrency(invoice.totalGrossValue)}</TableCell>
                                    <TableCell className="text-right">
                                        {/* Zamiast linku, mamy przycisk z akcją onClick */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => downloadMutation.mutate(invoice)}
                                            disabled={downloadMutation.isPending && downloadMutation.variables?.id === invoice.id}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
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