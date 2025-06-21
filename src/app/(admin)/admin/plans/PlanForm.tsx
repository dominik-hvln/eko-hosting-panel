'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch'; // Potrzebujemy nowego komponentu

// Definiujemy schemat walidacji za pomocą Zod
const formSchema = z.object({
    name: z.string().min(3, 'Nazwa musi mieć co najmniej 3 znaki.'),
    price: z.coerce.number().positive('Cena musi być liczbą dodatnią.'),
    cpuLimit: z.coerce.number().int().positive(),
    ramLimit: z.coerce.number().int().positive(),
    diskSpaceLimit: z.coerce.number().int().positive(),
    monthlyTransferLimit: z.coerce.number().int().positive(),
    isPublic: z.boolean().default(true),
});

// Definiujemy typy dla propsów komponentu
interface PlanFormProps {
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    isPending: boolean;
}

export function PlanForm({ onSubmit, isPending }: PlanFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            price: 10.0,
            cpuLimit: 100,
            ramLimit: 1024,
            diskSpaceLimit: 5120,
            monthlyTransferLimit: 50,
            isPublic: true,
        },
    });

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
                {/* Tutaj można dodać resztę pól (cpu, ram, etc.) w ten sam sposób */}
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
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Zapisywanie...' : 'Zapisz Plan'}
                </Button>
            </form>
        </Form>
    );
}