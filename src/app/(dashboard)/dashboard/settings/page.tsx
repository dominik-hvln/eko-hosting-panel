

'use client';

import { apiClient } from '@/lib/api-helpers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ProfileForm, type ProfileData } from './ProfileForm';

// Schemat dla formularza zmiany hasła
const passwordFormSchema = z.object({
    oldPassword: z.string().min(1, { message: 'Stare hasło jest wymagane.' }),
    newPassword: z.string().min(8, { message: 'Nowe hasło musi mieć co najmniej 8 znaków.' }),
    confirmPassword: z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Nowe hasła nie są identyczne.',
        path: ['confirmPassword'],
    });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
    const queryClient = useQueryClient();

    const { data: profileData, isLoading: isProfileLoading } = useQuery<ProfileData>({
        queryKey: ['user-profile'],
        queryFn: () => apiClient.get('/users/profile'),
    });

    const profileMutation = useMutation({
        mutationFn: (data: ProfileData) => apiClient.patch('/users/profile', data),
        onSuccess: () => {
            toast.success('Dane profilu zostały zaktualizowane.');
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
        onError: (error: Error) => toast.error(`Błąd: ${error.message}`),
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    });

    const passwordMutation = useMutation({
        mutationFn: (data: Omit<PasswordFormValues, 'confirmPassword'>) => apiClient.patch('/users/me/change-password', data),
        onSuccess: () => {
            toast.success('Hasło zostało pomyślnie zmienione!');
            passwordForm.reset();
        },
        onError: (error: Error) => {
            toast.error(`Błąd: ${error.message}`);
        },
    });

    const onPasswordSubmit = (values: PasswordFormValues) => {
        const { confirmPassword, ...dataToSend } = values;
        passwordMutation.mutate(dataToSend);
    };

    if (isProfileLoading) return <div>Ładowanie ustawień...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Ustawienia Konta</h1>
                <p className="text-muted-foreground">Zarządzaj danymi swojego konta i bezpieczeństwem.</p>
            </div>

            {/* NOWY DIV Z SIATKĄ, KTÓRY OTACZA OBIE KARTY */}
            <div className="grid gap-8 md:grid-cols-2">

                {/* Karta 1: Dane do Faktury */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dane do Faktury</CardTitle>
                        <CardDescription>Te dane będą używane na Twoich fakturach.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {profileData && (
                            <ProfileForm
                                initialData={profileData}
                                isPending={profileMutation.isPending}
                                onSubmit={profileMutation.mutate}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Karta 2: Zmiana Hasła */}
                <Card>
                    <CardHeader>
                        <CardTitle>Zmiana Hasła</CardTitle>
                        <CardDescription>Pamiętaj, aby używać silnych i unikalnych haseł.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-sm">
                                <FormField
                                    control={passwordForm.control}
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
                                    control={passwordForm.control}
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
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Potwierdź Nowe Hasło</FormLabel>
                                            <FormControl><Input type="password" required {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={passwordMutation.isPending}>
                                    {passwordMutation.isPending ? 'Zmienianie...' : 'Zmień hasło'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}