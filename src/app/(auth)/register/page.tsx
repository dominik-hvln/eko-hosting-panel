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

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Hasła nie są identyczne.');
            return;
        }
        setIsSubmitting(true);

        try {
            // Używamy apiClient
            await apiClient.post('/users', { email, password });
            toast.success('Konto zostało pomyślnie utworzone! Możesz się teraz zalogować.');
            router.push('/login');
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
                        <CardTitle className="text-2xl">Rejestracja</CardTitle>
                        <CardDescription>Stwórz nowe konto, aby zacząć korzystać z platformy.</CardDescription>
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
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Potwierdź Hasło</Label>
                            <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Rejestrowanie...' : 'Zarejestruj się'}
                        </Button>
                        <p className="text-xs text-center text-gray-600 w-full">
                            Masz już konto?{' '}
                            <Link href="/login" className="font-semibold text-gray-800 hover:underline">Zaloguj się</Link>
                        </p>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}