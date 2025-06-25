// src/app/(admin)/admin/plans/PlanForm.tsx

'use client';

import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

export const formSchema = z.object({
    name: z.string().min(2, { message: 'Nazwa musi mieć co najmniej 2 znaki.' }),
    price: z.coerce.number().min(0, { message: 'Cena nie może być ujemna.' }),
    yearlyPrice: z.coerce.number().min(0, { message: 'Cena nie może być ujemna.' }).nullable(),
    cpuLimit: z.coerce.number().int().positive(),
    ramLimit: z.coerce.number().int().positive(),
    diskSpaceLimit: z.coerce.number().int().positive(),
    monthlyTransferLimit: z.coerce.number().int().positive(),
    isPublic: z.boolean().default(true),
    // --- NOWE POLA W SCHEMACIE WALIDACJI ---
    stripeProductId: z.string().optional().or(z.literal('')),
    stripeMonthlyPriceId: z.string().optional().or(z.literal('')),
    stripeYearlyPriceId: z.string().optional().or(z.literal('')),
});

export type FormValues = z.infer<typeof formSchema>;

interface PlanFormProps {
    onSubmit: (values: FormValues) => void;
    isPending: boolean;
    form: UseFormReturn<FormValues>;
}

export function PlanForm({ onSubmit, isPending, form }: PlanFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Istniejące pola bez zmian */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nazwa Planu</FormLabel>
                            <FormControl>
                                <Input placeholder="np. Hosting Basic" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cena (PLN / miesiąc)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="yearlyPrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cena (PLN / rok)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    value={field.value ?? ''}
                                    placeholder="Zostaw puste, jeśli nie dotyczy"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Sekcja z limitami pozostaje bez zmian */}
                {/* ... (cpuLimit, ramLimit, etc.) ... */}

                <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <FormLabel>Publiczny</FormLabel>
                                <FormDescription>Czy ten plan ma być widoczny dla klientów.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Separator />

                {/* --- NOWA SEKCJA DLA PÓL STRIPE --- */}
                <div>
                    <h3 className="text-lg font-medium">Integracja ze Stripe</h3>
                    <p className="text-sm text-muted-foreground">Wklej tutaj ID ze swojego konta Stripe.</p>
                </div>

                <FormField
                    control={form.control}
                    name="stripeProductId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stripe Product ID</FormLabel>
                            <FormControl>
                                <Input placeholder="prod_..." {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="stripeMonthlyPriceId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stripe Monthly Price ID</FormLabel>
                            <FormControl>
                                <Input placeholder="price_..." {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="stripeYearlyPriceId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stripe Yearly Price ID</FormLabel>
                            <FormControl>
                                <Input placeholder="price_..." {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* ------------------------------------- */}

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? 'Zapisywanie...' : 'Zapisz'}
                </Button>
            </form>
        </Form>
    );
}