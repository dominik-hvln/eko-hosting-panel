'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ProfileData {
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
    taxId?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    zipCode?: string | null;
    country?: string | null;
}

// Uzupełniamy schemat o nullable(), aby akceptował puste wartości
export const formSchema = z.object({
    firstName: z.string().nullable().optional().or(z.literal('')),
    lastName: z.string().nullable().optional().or(z.literal('')),
    companyName: z.string().nullable().optional().or(z.literal('')),
    taxId: z.string().nullable().optional(),
    addressLine1: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    zipCode: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
    onSubmit: (values: FormValues) => void;
    isPending: boolean;
    initialData?: ProfileData;
}

export function ProfileForm({ onSubmit, isPending, initialData }: ProfileFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || { country: 'Polska' },
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nazwa Firmy (opcjonalnie)</FormLabel>
                            <FormControl><Input placeholder="Moja Firma sp. z o.o." {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Imię</FormLabel>
                                <FormControl><Input placeholder="Jan" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nazwisko</FormLabel>
                                <FormControl><Input placeholder="Kowalski" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIP</FormLabel>
                            <FormControl><Input placeholder="123-456-78-90" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adres - linia 1</FormLabel>
                            <FormControl><Input placeholder="ul. Przykładowa 123" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kod Pocztowy</FormLabel>
                                <FormControl><Input placeholder="00-000" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Miasto</FormLabel>
                                <FormControl><Input placeholder="Warszawa" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kraj</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value ?? 'Polska'}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Wybierz kraj" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Polska">Polska</SelectItem>
                                    <SelectItem value="Niemcy">Niemcy</SelectItem>
                                    <SelectItem value="Wielka Brytania">Wielka Brytania</SelectItem>
                                    <SelectItem value="Stany Zjednoczone">Stany Zjednoczone</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </Button>
            </form>
        </Form>
    );
}