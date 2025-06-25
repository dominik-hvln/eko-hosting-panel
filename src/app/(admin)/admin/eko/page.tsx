// src/app/(admin)/admin/eko/page.tsx

'use client';

import { apiClient } from '@/lib/api-helpers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EkoSettingsForm, FormValues } from './EkoSettingsForm';

export default function AdminEkoPage() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading, isError } = useQuery<FormValues>({
        queryKey: ['admin-eko-settings'],
        queryFn: () => apiClient.get('/eko/settings'),
    });

    const mutation = useMutation({
        mutationFn: (data: FormValues) => apiClient.patch('/eko/settings', data),
        onSuccess: () => {
            toast.success('Ustawienia EKO zostały zaktualizowane!');
            queryClient.invalidateQueries({ queryKey: ['admin-eko-settings'] });
        },
        onError: (error: Error) => {
            toast.error(`Błąd: ${error.message}`);
        },
    });

    if (isLoading) return <div>Ładowanie ustawień...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania danych.</div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Systemem EKO</h1>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Globalne Ustawienia Punktów EKO</CardTitle>
                    <CardDescription>
                        W tym miejscu możesz skonfigurować sposób naliczania i wartość punktów EKO w całej platformie.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {settings && (
                        <EkoSettingsForm
                            initialData={settings}
                            isPending={mutation.isPending}
                            onSubmit={mutation.mutate}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}