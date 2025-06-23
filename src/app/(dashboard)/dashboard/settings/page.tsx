'use client';

import { apiClient } from '@/lib/api-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Schemat Zod z walidacją, która sprawdza, czy nowe hasła są takie same
const formSchema = z
    .object({
        oldPassword: z.string().min(1, { message: 'Stare hasło jest wymagane.' }),
        newPassword: z.string().min(8, { message: 'Nowe hasło musi mieć co najmniej 8 znaków.' }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Nowe hasła nie są identyczne.',
        path: ['confirmPassword'], // Błąd pojawi się przy polu "Potwierdź hasło"
    });

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    });

    const mutation = useMutation({
        mutationFn: (data: Omit<FormValues, 'confirmPassword'>) => apiClient.patch('/users/me/change-password', data),
        onSuccess: () => {
            toast.success('Hasło zostało pomyślnie zmienione!');
            form.reset(); // Czyścimy formularz po sukcesie
        },
        onError: (error: Error) => {
            toast.error(`Błąd: ${error.message}`);
        },
    });

    const onSubmit = (values: FormValues) => {
        // Usuwamy pole confirmPassword przed wysłaniem do API
        const { confirmPassword, ...dataToSend } = values;
        mutation.mutate(dataToSend);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Ustawienia Konta</h1>
                <p className="text-muted-foreground">Zarządzaj danymi swojego konta i bezpieczeństwem.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Zmiana Hasła</CardTitle>
                    <CardDescription>Pamiętaj, aby używać silnych i unikalnych haseł.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
                            <FormField
                                control={form.control}
                                name="oldPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stare Hasło</FormLabel>
                                        <FormControl><Input type="password" required {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nowe Hasło</FormLabel>
                                        <FormControl><Input type="password" required {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Potwierdź Nowe Hasło</FormLabel>
                                        <FormControl><Input type="password" required {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Zmienianie...' : 'Zmień hasło'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}