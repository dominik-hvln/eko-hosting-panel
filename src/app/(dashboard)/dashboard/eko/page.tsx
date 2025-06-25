'use client';

import { apiClient } from '@/lib/api-helpers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EkoForest } from './EkoForest';
import { jwtDecode } from 'jwt-decode';
import { Textarea } from '@/components/ui/textarea';

// Interfejsy i typy bez zmian...
interface EkoActionHistory {
    id: string;
    actionType: string;
    points: number; // Zmieniamy 'pointsChange' na 'points' zgodnie z nowym API
    createdAt: string;
}
interface EkoSummary {
    currentPoints: number;
    pointsPerPln: number;
    treesPlanted: number;
    progressToNextTree: number;
    currentTreeStage: number;
    history: EkoActionHistory[];
}
interface DecodedToken {
    sub: string;
}

// Słownik tłumaczeń dla akcji EKO
const ekoActionLabels: Record<string, string> = {
    redeem_for_credit: 'Wymiana na środki',
    auto_renewal_reward: 'Nagroda za auto-odnawianie',
    yearly_payment_reward: 'Nagroda za płatność roczną',
    '2fa_enabled_reward': 'Nagroda za włączenie 2FA',
    dark_mode_enabled: 'Nagroda za tryb ciemny',
};


export default function EkoPage() {
    const queryClient = useQueryClient();
    const [pointsToRedeem, setPointsToRedeem] = useState<number | ''>('');
    const [badgeScript, setBadgeScript] = useState<string>('Ładowanie kodu badge...');

    const { data: summary, isLoading, isError } = useQuery<EkoSummary>({
        queryKey: ['eko-summary'],
        queryFn: () => apiClient.get('/eko/summary'),
    });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: DecodedToken = jwtDecode(token);
                const userId = decoded.sub;
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const scriptTag = `<script src="${apiUrl}/eko/badge.js?userId=${userId}" async defer></script>`;
                setBadgeScript(scriptTag);
            } catch (e) {
                console.error('Błąd dekodowania tokenu:', e);
                setBadgeScript('Nie udało się wygenerować kodu. Spróbuj odświeżyć stronę.');
            }
        }
    }, []);


    const redeemMutation = useMutation({
        mutationFn: (points: number) => apiClient.post('/eko/redeem', { points }),
        onSuccess: () => {
            toast.success('Punkty zostały pomyślnie wymienione!');
            queryClient.invalidateQueries({ queryKey: ['eko-summary'] });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            setPointsToRedeem('');
        },
        onError: (error: Error) => toast.error(`Błąd: ${error.message}`),
    });

    const handleRedeem = () => {
        const points = Number(pointsToRedeem);
        if (points > 0 && parseFloat(summary?.currentPoints.toString() || '0') >= points) {
            redeemMutation.mutate(points);
        } else {
            toast.error('Wpisz poprawną liczbę punktów lub nie masz wystarczających środków.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(badgeScript);
        toast.success('Skrypt skopiowano do schowka!');
    };


    if (isLoading) return <div className="p-8">Ładowanie Twojego statusu EKO...</div>;
    if (isError) return <div className="p-8">Wystąpił błąd podczas pobierania danych.</div>;

    return (
        <div className="space-y-8">
            <Card className="p-4 md:p-6">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Twój Las EKO</CardTitle>
                    <CardDescription>Każdy zdobyty punkt przyczynia się do sadzenia kolejnych drzew.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EkoForest
                        treesPlanted={summary?.treesPlanted || 0}
                        currentTreeStage={summary?.currentTreeStage || 1}
                    />
                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground">Postęp do następnego drzewa: {summary?.progressToNextTree}%</p>
                        <Progress value={summary?.progressToNextTree} className="mt-2 max-w-sm mx-auto" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle className="text-2xl">Twoje Punkty</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold">{summary?.currentPoints}</p>
                        <p className="text-sm text-muted-foreground">punktów EKO do wykorzystania</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Wymień Punkty na Środki</CardTitle>
                        <CardDescription>1 PLN = {summary?.pointsPerPln} punktów</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input type="number" placeholder="Wpisz liczbę punktów" value={pointsToRedeem} onChange={(e) => setPointsToRedeem(e.target.value === '' ? '' : Number(e.target.value))} />
                        <Button onClick={handleRedeem} disabled={redeemMutation.isPending} className="w-full">
                            {redeemMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Wymień na {pointsToRedeem ? (Number(pointsToRedeem) / (summary?.pointsPerPln || 100)).toFixed(2) : '0.00'} PLN
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Generator Badge'a</CardTitle>
                        <CardDescription>Pokaż światu, że Twoja strona jest EKO! Wklej poniższy kod na swoją stronę.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Textarea
                            readOnly
                            value={badgeScript}
                            className="text-xs font-mono h-24 resize-none"
                        />
                        <Button onClick={copyToClipboard} variant="outline" className="w-full">
                            <Copy className="mr-2 h-4 w-4" />
                            Kopiuj do schowka
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader><CardTitle>Historia Akcji EKO</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Akcja</TableHead><TableHead>Zmiana Punktów</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {summary?.history.length === 0 && <TableRow><TableCell colSpan={3} className="text-center h-24">Brak historii akcji.</TableCell></TableRow>}
                                {summary?.history.map((action) => (
                                    <TableRow key={action.id}>
                                        {/* Używamy słownika do tłumaczenia, z fallbackiem na surową wartość */}
                                        <TableCell className="font-medium">{ekoActionLabels[action.actionType] || action.actionType}</TableCell>

                                        {/* Używamy poprawnej właściwości 'points' i dodajemy formatowanie */}
                                        <TableCell className={action.points > 0 ? 'text-green-500' : 'text-red-500'}>
                                            {action.points > 0 ? `+${action.points}` : action.points}
                                        </TableCell>

                                        <TableCell>{new Date(action.createdAt).toLocaleString()}</TableCell>
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