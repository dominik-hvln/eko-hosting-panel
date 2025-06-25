// src/app/(admin)/admin/eko/EkoSettingsForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useEffect } from 'react';

export const formSchema = z.object({
    pointsPerPln: z.coerce.number().int().positive({ message: 'Wartość musi być dodatnia.' }),
    pointsToPlantTree: z.coerce.number().int().positive({ message: 'Wartość musi być dodatnia.' }),
    pointsForDarkMode: z.coerce.number().int().positive({ message: 'Wartość musi być dodatnia.' }),
    pointsFor2FA: z.coerce.number().int().positive({ message: 'Wartość musi być dodatnia.' }),
    pointsForAutoRenew: z.coerce.number().int().positive({ message: 'Wartość musi być dodatnia.' }),
    pointsForYearlyPayment: z.coerce.number().int().positive({ message: 'Wartość musi być dodatnia.' }),
});

export type FormValues = z.infer<typeof formSchema>;

interface EkoSettingsFormProps {
    onSubmit: (values: FormValues) => void;
    isPending: boolean;
    initialData?: Partial<FormValues>;
}

export function EkoSettingsForm({ onSubmit, isPending, initialData }: EkoSettingsFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {},
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="pointsPerPln"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Punkty za 1 PLN</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Ile punktów użytkownik dostaje za każdą wydaną złotówkę.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pointsToPlantTree"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Punkty na 1 drzewo</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Próg punktowy do "posadzenia" wirtualnego drzewa.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pointsFor2FA"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bonus za włączenie 2FA</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Jednorazowa nagroda za włączenie 2FA.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pointsForAutoRenew"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bonus za auto-odnawianie</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Jednorazowa nagroda za włączenie automatycznego odnawiania.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pointsForYearlyPayment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bonus za płatność roczną</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Nagroda za opłacenie usługi na rok z góry.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pointsForDarkMode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bonus za tryb ciemny (badge)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Jednorazowa nagroda za włączenie trybu ciemnego w panelu.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending ? 'Zapisywanie...' : 'Zapisz ustawienia'}
                </Button>
            </form>
        </Form>
    );
}