'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceStatus } from '@/common/enums/service-status.enum';
import { useEffect } from 'react';

export const formSchema = z.object({
    status: z.nativeEnum(ServiceStatus),
    autoRenew: z.boolean(),
});

export type FormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
    onSubmit: (values: FormValues) => void;
    isPending: boolean;
    initialData?: FormValues;
}

export function ServiceForm({ onSubmit, isPending, initialData }: ServiceFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData,
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

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
                                    <SelectTrigger><SelectValue placeholder="Wybierz status" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={ServiceStatus.ACTIVE}>Aktywna</SelectItem>
                                    <SelectItem value={ServiceStatus.SUSPENDED}>Zawieszona</SelectItem>
                                    <SelectItem value={ServiceStatus.CANCELLED}>Anulowana</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>Zmień status usługi klienta.</FormDescription>
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