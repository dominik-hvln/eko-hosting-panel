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

export default function LoginPage() {
    const router = useRouter(); // <-- 2. Inicjalizujemy router
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

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

            // --- NOWA LOGIKA ---
            // 3. Zapisujemy token w pamięci lokalnej przeglądarki
            localStorage.setItem('access_token', data.access_token);

            // 4. Przekierowujemy użytkownika na dashboard
            router.push('/dashboard');
            // --- KONIEC NOWEJ LOGIKI ---

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit}>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Logowanie</CardTitle>
                        <CardDescription>
                            Wprowadź swój email i hasło, aby zalogować się na swoje konto.
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
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            Zaloguj się
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </main>
    );
}