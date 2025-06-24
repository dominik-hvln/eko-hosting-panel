'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ServiceStatus } from '@/common/enums/service-status.enum';

export const editFormSchema = z.object({
    status: z.nativeEnum(ServiceStatus),
    autoRenew: z.boolean(),
    expiresAt: z.date(),
});
export type EditFormValues = z.infer<typeof editFormSchema>;

interface EditServiceFormProps {
    onSubmit: (values: EditFormValues) => void;
    isPending: boolean;
    initialData?: Partial<EditFormValues> & { expiresAt?: string | null };
}

export function EditServiceForm({ onSubmit, isPending, initialData }: EditServiceFormProps) {
    const form = useForm<EditFormValues>({ resolver: zodResolver(editFormSchema) });

    useEffect(() => {
        if (initialData) {
            form.reset({
                status: initialData.status,
                autoRenew: initialData.autoRenew,
                expiresAt: initialData.expiresAt ? new Date(initialData.expiresAt) : new Date(),
            });
        }
    }, [initialData, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel>Status Usługi</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value={ServiceStatus.ACTIVE}>Aktywna</SelectItem><SelectItem value={ServiceStatus.SUSPENDED}>Zawieszona</SelectItem><SelectItem value={ServiceStatus.CANCELLED}>Anulowana</SelectItem></SelectContent></Select></FormItem> )} />
                <FormField control={form.control} name="expiresAt" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Data wygaśnięcia</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP', { locale: pl }) : <span>Wybierz datę</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="autoRenew" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Automatyczne odnawianie</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )} />
                <Button type="submit" disabled={isPending} className="w-full">{isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}</Button>
            </form>
        </Form>
    );
}