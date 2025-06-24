'use client';

import { apiClient } from '@/lib/api-helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Wallet { balance: string; }
interface Transaction { id: string; amount: string; type: string; status: string; createdAt: string; description: string | null; }
interface PaymentRequest { id: string; title: string; amount: number; status: string; }

const transactionTypeLabels: Record<string, string> = {
    top_up: 'Doładowanie',
    payment: 'Płatność za usługę',
    refund: 'Zwrot środków',
};

export default function WalletPage() {
    const queryClient = useQueryClient();
    // Zapytanie o dane portfela
    const { data: wallet, isLoading: isWalletLoading } = useQuery<Wallet>({
        queryKey: ['wallet'],
        queryFn: () => apiClient.get('/wallet'),
    });

    // Zapytanie o historię transakcji
    const { data: transactions, isLoading: areTransactionsLoading } = useQuery<Transaction[]>({
        queryKey: ['transactions'],
        queryFn: () => apiClient.get('/transactions'),
    });

    // Zapytanie o oczekujące płatności
    const { data: paymentRequests, isLoading: areRequestsLoading } = useQuery<PaymentRequest[]>({
        queryKey: ['payment-requests'],
        queryFn: () => apiClient.get('/payment-requests'),
    });

    const onPaymentSuccess = (paymentUrl: string) => {
        window.open(paymentUrl, '_blank');
        toast.success('Przekierowywanie do strony płatności...');
        // Odświeżamy dane po powrocie użytkownika
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
    };
    const onPaymentError = (error: Error) => { toast.error(`Błąd: ${error.message}`); };

    // Mutacja doładowania portfela
    const topUpMutation = useMutation({
        mutationFn: (data: { amount: number }) => apiClient.post('/payments/top-up/stripe', data),
        onSuccess: (data: any) => {
            onPaymentSuccess(data.paymentUrl);
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: onPaymentError,
    });

    // Mutacja opłacania żądania
    const payRequestMutation = useMutation({
        mutationFn: (requestId: string) => apiClient.post(`/payments/pay-for-request/${requestId}`, {}),
        onSuccess: (data: any) => {
            onPaymentSuccess(data.paymentUrl);
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
        },
        onError: onPaymentError,
    });

    const isLoading = isWalletLoading || areTransactionsLoading || areRequestsLoading;
    const formatCurrency = (amountInGr: number) => `${(amountInGr / 100).toFixed(2)} PLN`;


    if (isLoading) return <div className="p-8">Ładowanie danych portfela...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Mój Portfel</h1>
                <p className="text-muted-foreground">Zarządzaj swoim saldem i przeglądaj historię transakcji.</p>
            </div>
            <Separator />

            {paymentRequests && paymentRequests.length > 0 && (
                <Card className="border-yellow-500 dark:border-yellow-700">
                    <CardHeader>
                        <CardTitle className="text-yellow-600 dark:text-yellow-500">Płatności do realizacji</CardTitle>
                        <CardDescription>Poniżej znajdują się oczekujące płatności wygenerowane przez administratora.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {paymentRequests.map(req => (
                                <li key={req.id} className="flex justify-between items-center p-3 bg-secondary rounded-md">
                                    <div>
                                        <p className="font-semibold">{req.title}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(req.amount)}</p>
                                    </div>
                                    <Button
                                        onClick={() => payRequestMutation.mutate(req.id)}
                                        disabled={payRequestMutation.isPending && payRequestMutation.variables === req.id}
                                    >
                                        {(payRequestMutation.isPending && payRequestMutation.variables === req.id)
                                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            : null}
                                        Zapłać teraz
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle>Aktualne Saldo</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-5xl font-bold">{wallet?.balance ?? '0.00'} PLN</p>
                        <Button className="w-full" onClick={() => topUpMutation.mutate({ amount: 50 })} disabled={topUpMutation.isPending}>
                            {topUpMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Doładuj 50 PLN
                        </Button>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Historia Transakcji</CardTitle>
                        <CardDescription>Ostatnie operacje w Twoim portfelu.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Opis</TableHead><TableHead>Kwota</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {transactions?.length === 0 && <TableRow><TableCell colSpan={3} className="text-center h-24">Brak transakcji.</TableCell></TableRow>}
                                {transactions?.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>{tx.description || transactionTypeLabels[tx.type] || tx.type}</TableCell>
                                        <TableCell className={`font-medium ${parseFloat(tx.amount) > 0 ? 'text-green-600' : 'text-foreground'}`}>
                                            {parseFloat(tx.amount) > 0 ? `+${tx.amount}` : tx.amount} PLN
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}