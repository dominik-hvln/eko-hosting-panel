'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- 1. Importujemy useRouter do przekierowań
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter(); // <-- 2. Inicjalizujemy router
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const res = await fetch('http://localhost:4000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Nie udało się zalogować.');
            }

            const data = await res.json();

            localStorage.setItem('access_token', data.access_token);
            router.push('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsSubmitting(false); // <-- BRAKUJĄCA LINIA
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {/* Miejsce na Twoje logo */}
            <div className="mb-8 h-10">
                {/* <Image src="/logo.svg" width={40} height={40} alt="Logo" /> */}
                <h1 className="text-2xl font-bold">EKO-HOSTING</h1>
            </div>
            {/* Usuwamy <main> - layoutem zarządza teraz plik layout.tsx */}
            <form onSubmit={handleSubmit}>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Logowanie</CardTitle>
                        <CardDescription>
                            Wprowadź swój email i hasło, aby się zalogować.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Hasło</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
                        </Button>
                        {/* Link do rejestracji */}
                        <p className="text-xs text-center text-gray-600 w-full">
                            Nie masz konta?{' '}
                            <Link href="/register" className="font-semibold text-gray-800 hover:underline">
                                Zarejestruj się
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}