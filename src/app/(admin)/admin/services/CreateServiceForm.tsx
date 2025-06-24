'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BillingCycle } from '@/common/enums/billing-cycle.enum';

interface User { id: string; email: string; }
interface Plan { id: string; name: string; }

export const createFormSchema = z.object({
    name: z.string().min(3, { message: 'Nazwa musi mieć co najmniej 3 znaki.' }),
    userId: z.string({ required_error: 'Musisz wybrać klienta.' }),
    planId: z.string({ required_error: 'Musisz wybrać plan.' }),
    billingCycle: z.nativeEnum(BillingCycle),
});
export type CreateFormValues = z.infer<typeof createFormSchema>;

interface CreateServiceFormProps {
    onSubmit: (values: CreateFormValues) => void;
    isPending: boolean;
    users: User[];
    plans: Plan[];
}

export function CreateServiceForm({ onSubmit, isPending, users, plans }: CreateServiceFormProps) {
    const form = useForm<CreateFormValues>({
        resolver: zodResolver(createFormSchema),
        defaultValues: { name: '', billingCycle: BillingCycle.MONTHLY },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nazwa Usługi</FormLabel><FormControl><Input placeholder="np. Strona firmowa klienta X" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="userId" render={({ field }) => (<FormItem><FormLabel>Klient</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz klienta" /></SelectTrigger></FormControl><SelectContent>{users.map(user => <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="planId" render={({ field }) => (<FormItem><FormLabel>Plan</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz plan" /></SelectTrigger></FormControl><SelectContent>{plans.map(plan => <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="billingCycle" render={({ field }) => (<FormItem><FormLabel>Cykl Rozliczeniowy</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value={BillingCycle.MONTHLY}>Miesięczny</SelectItem><SelectItem value={BillingCycle.YEARLY}>Roczny</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <Button type="submit" disabled={isPending} className="w-full">{isPending ? 'Tworzenie...' : 'Stwórz usługę'}</Button>
            </form>
        </Form>
    );
}