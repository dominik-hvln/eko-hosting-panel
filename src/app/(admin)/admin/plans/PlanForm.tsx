'use client';

import { useForm } from 'react-hook-form';
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

// Definiujemy i eksportujemy schemat i typ, aby strona-rodzic też mogła ich używać
export const formSchema = z.object({
    name: z.string().min(2, { message: 'Nazwa musi mieć co najmniej 2 znaki.' }),
    price: z.coerce.number().min(0, { message: 'Cena nie może być ujemna.' }),
    cpuLimit: z.coerce.number().int().positive(),
    ramLimit: z.coerce.number().int().positive(),
    diskSpaceLimit: z.coerce.number().int().positive(),
    monthlyTransferLimit: z.coerce.number().int().positive(),
    isPublic: z.boolean().default(true),
});

export type FormValues = z.infer<typeof formSchema>;

interface PlanFormProps {
    onSubmit: (values: FormValues) => void;
    isPending: boolean;
    // Przekazujemy całą instancję formularza z góry, aby uniknąć błędów
    form: ReturnType<typeof useForm<FormValues>>;
}

export function PlanForm({ onSubmit, isPending, form }: PlanFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            <FormLabel>Cena (PLN)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* W przyszłości można tu dodać resztę pól w ten sam sposób */}
                <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <FormLabel>Publiczny</FormLabel>
                                <FormDescription>
                                    Czy ten plan ma być widoczny dla klientów.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? 'Zapisywanie...' : 'Zapisz'}
                </Button>
            </form>
        </Form>
    );
}