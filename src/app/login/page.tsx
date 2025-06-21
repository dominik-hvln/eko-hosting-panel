'use client'; // <-- Kluczowa linijka! Mówi Next.js, że ten komponent jest interaktywny i działa w przeglądarce.

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
import { useState } from 'react'; // Importujemy hook useState

export default function LoginPage() {
    // Tworzymy "stan" dla naszych pól formularza
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Zapobiegamy domyślnemu przeładowaniu strony
        setError(''); // Resetujemy błąd przy każdej próbie

        try {
            // Wysyłamy zapytanie do naszego backendu na porcie 4000
            const res = await fetch('http://localhost:4000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                // Jeśli odpowiedź serwera nie jest pomyślna (np. błąd 401)
                const errorData = await res.json();
                throw new Error(errorData.message || 'Nie udało się zalogować.');
            }

            // Jeśli logowanie się udało
            const data = await res.json();
            console.log('Zalogowano pomyślnie! Token:', data.access_token);
            // TODO: W przyszłości zapiszemy token i przekierujemy użytkownika
            alert('Zalogowano pomyślnie!');
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            {/* Używamy <form> zamiast <div> */}
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
                            {/* Łączymy inputy z naszym stanem */}
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
                        {/* Wyświetlamy błąd, jeśli wystąpi */}
                        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Zaloguj się</Button>
                    </CardFooter>
                </Card>
            </form>
        </main>
    );
}