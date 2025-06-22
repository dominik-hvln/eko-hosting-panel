'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Definiujemy schemat walidacji dla edytowalnych pól
export const formSchema = z.object({
    status: z.enum(['active', 'suspended', 'cancelled']),
    autoRenew: z.boolean(),
});

export type FormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
    onSubmit: (values: FormValues) => void;
    isPending: boolean;
    form: ReturnType<typeof useForm<FormValues>>;
}

export function ServiceForm({ onSubmit, isPending, form }: ServiceFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status Usługi</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wybierz status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="active">Aktywna</SelectItem>
                                    <SelectItem value="suspended">Zawieszona</SelectItem>
                                    <SelectItem value="cancelled">Anulowana</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Zmiana statusu usługi (np. zawieszenie za brak płatności).
                            </FormDescription>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="autoRenew"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Automatyczne odnawianie</FormLabel>
                                <FormDescription>
                                    Czy usługa ma być automatycznie odnawiana na kolejny okres.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
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