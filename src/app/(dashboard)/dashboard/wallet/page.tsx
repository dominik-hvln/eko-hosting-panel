'use client';

import { apiClient } from '@/lib/api-helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface Wallet { balance: string; }
interface Transaction { id: string; amount: string; type: string; status: string; createdAt: string; }

const transactionTypeLabels: Record<string, string> = {
    top_up: 'Doładowanie',
    payment: 'Płatność za usługę',
    refund: 'Zwrot środków',
};

export default function WalletPage() {
    const { data: wallet, isLoading: isWalletLoading } = useQuery<Wallet>({ queryKey: ['wallet'], queryFn: () => apiClient.get('/wallet') });
    const { data: transactions, isLoading: areTransactionsLoading } = useQuery<Transaction[]>({ queryKey: ['transactions'], queryFn: () => apiClient.get('/transactions') });

    const topUpMutation = useMutation({
        mutationFn: (data: { amount: number }) => apiClient.post('/payments/top-up/stripe', data),
        onSuccess: (data: any) => {
            window.open(data.paymentUrl, '_blank');
            toast.success('Przekierowywanie do strony płatności...');
        },
        onError: (error: Error) => {
            toast.error('Nie udało się utworzyć sesji płatności.');
        },
    });

    if (isWalletLoading || areTransactionsLoading) return <div>Ładowanie danych portfela...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Mój Portfel</h1>
                <p className="text-muted-foreground">Zarządzaj swoim saldem i przeglądaj historię transakcji.</p>
            </div>
            <Separator />
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle>Aktualne Saldo</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-5xl font-bold">{wallet?.balance ?? '0.00'} PLN</p>
                        <Button className="w-full" onClick={() => topUpMutation.mutate({ amount: 50 })} disabled={topUpMutation.isPending}>
                            {topUpMutation.isPending ? 'Przetwarzanie...' : 'Doładuj 50 PLN (Stripe)'}
                        </Button>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader><CardTitle>Historia Transakcji</CardTitle><CardDescription>Ostatnie operacje w Twoim portfelu.</CardDescription></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Typ</TableHead><TableHead>Kwota</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {transactions?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">Brak transakcji.</TableCell></TableRow>}
                                {transactions?.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                                        <TableCell><Badge variant="outline">{transactionTypeLabels[tx.type] || tx.type}</Badge></TableCell>
                                        <TableCell className={parseFloat(tx.amount) > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>{parseFloat(tx.amount) > 0 ? `+${tx.amount}` : tx.amount} PLN</TableCell>
                                        <TableCell><Badge>{tx.status}</Badge></TableCell>
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