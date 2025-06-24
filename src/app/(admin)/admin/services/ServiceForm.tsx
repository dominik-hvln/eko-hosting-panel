'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import { ServiceStatus } from '@/common/enums/service-status.enum';
import { BillingCycle } from '@/common/enums/billing-cycle.enum';

interface User { id: string; email: string; }
interface Plan { id: string; name: string; }

// Ten schemat zawiera wszystkie możliwe pola
export const formSchema = z.object({
    name: z.string().min(3, { message: 'Nazwa musi mieć co najmniej 3 znaki.' }).optional(),
    userId: z.string().optional(),
    planId: z.string().optional(),
    billingCycle: z.nativeEnum(BillingCycle).optional(),
    expiresAt: z.date().optional(),
    status: z.nativeEnum(ServiceStatus).optional(),
    autoRenew: z.boolean().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
    onSubmit: (values: FormValues) => void;
    isPending: boolean;
    initialData?: Partial<FormValues> & { expiresAt?: string | null };
    users: User[];
    plans: Plan[];
}

export function ServiceForm({ onSubmit, isPending, initialData, users, plans }: ServiceFormProps) {
    const isEditing = !!initialData; // Sprawdzamy, czy jesteśmy w trybie edycji

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            userId: undefined,
            planId: undefined,
            billingCycle: BillingCycle.MONTHLY,
            expiresAt: undefined,
            status: ServiceStatus.ACTIVE,
            autoRenew: true,
            ...initialData, // Nadpisujemy wartości, jeśli edytujemy
            expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt) : undefined,
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                status: initialData.status,
                autoRenew: initialData.autoRenew,
                expiresAt: initialData.expiresAt ? new Date(initialData.expiresAt) : undefined,
            });
        } else {
            form.reset({
                name: `Nowa usługa #${Math.floor(Math.random() * 1000)}`,
                userId: undefined,
                planId: undefined,
                billingCycle: BillingCycle.MONTHLY,
                expiresAt: undefined,
                status: ServiceStatus.ACTIVE,
                autoRenew: true,
            });
        }
    }, [initialData, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!isEditing && ( // Pola tylko dla tworzenia
                    <>
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nazwa Usługi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="userId" render={({ field }) => ( <FormItem><FormLabel>Klient</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz klienta" /></SelectTrigger></FormControl><SelectContent>{users.map(user => <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="planId" render={({ field }) => ( <FormItem><FormLabel>Plan</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz plan" /></SelectTrigger></FormControl><SelectContent>{plans.map(plan => <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                    </>
                )}

                <FormField control={form.control} name="billingCycle" render={({ field }) => ( <FormItem><FormLabel>Cykl Rozliczeniowy</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value={BillingCycle.MONTHLY}>Miesięczny</SelectItem><SelectItem value={BillingCycle.YEARLY}>Roczny</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />

                <FormField control={form.control} name="expiresAt" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Data wygaśnięcia (opcjonalnie przy tworzeniu)</FormLabel><Popover><PopoverTrigger asChild><FormControl>
                    <Button variant="outline" className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                        {field.value ? format(field.value, 'PPP', { locale: pl }) : <span>Wybierz datę</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormDescription>Jeśli puste, data ustawi się automatycznie.</FormDescription><FormMessage /></FormItem> )} />

                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel>Status Usługi</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value={ServiceStatus.ACTIVE}>Aktywna</SelectItem><SelectItem value={ServiceStatus.SUSPENDED}>Zawieszona</SelectItem><SelectItem value={ServiceStatus.CANCELLED}>Anulowana</SelectItem></SelectContent></Select></FormItem> )} />

                <FormField control={form.control} name="autoRenew" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Automatyczne odnawianie</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )} />

                <Button type="submit" disabled={isPending} className="w-full">{isPending ? 'Zapisywanie...' : 'Zapisz'}</Button>
            </form>
        </Form>
    );
}