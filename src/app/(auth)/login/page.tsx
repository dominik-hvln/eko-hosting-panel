'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-helpers'; // <-- Używamy nowego klienta
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Używamy apiClient, cała logika fetch jest teraz w jednym miejscu
            const data = await apiClient.post<{ access_token: string }>('/auth/login', { email, password });

            localStorage.setItem('access_token', data.access_token);
            toast.success('Zalogowano pomyślnie!');
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="mb-8 h-10">
                <h1 className="text-2xl font-bold">EKO-HOSTING</h1>
            </div>
            <form onSubmit={handleSubmit}>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Logowanie</CardTitle>
                        <CardDescription>Wprowadź swój email i hasło, aby się zalogować.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Hasło</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
                        </Button>
                        <p className="text-xs text-center text-gray-600 w-full">
                            Nie masz konta?{' '}
                            <Link href="/register" className="font-semibold text-gray-800 hover:underline">Zarejestruj się</Link>
                        </p>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}