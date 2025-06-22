'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TicketPriority } from '@/common/enums/ticket-priority.enum';
import { useEffect } from 'react';

// Eksportujemy schemat i typ, aby inne pliki mogły z nich korzystać
export const createTicketSchema = z.object({
    subject: z
        .string()
        .min(5, { message: 'Temat musi mieć co najmniej 5 znaków.' }),
    priority: z.nativeEnum(TicketPriority),
    message: z
        .string()
        .min(10, { message: 'Wiadomość musi mieć co najmniej 10 znaków.' }),
});

export type CreateTicketValues = z.infer<typeof createTicketSchema>;

interface NewTicketFormProps {
    onSubmit: (values: CreateTicketValues) => void;
    isPending: boolean;
    // Ten props nie jest używany w tym formularzu, ale dodajemy dla spójności z PlanForm
    initialData?: Partial<CreateTicketValues>;
}

export function NewTicketForm({
                                  onSubmit,
                                  isPending,
                                  initialData,
                              }: NewTicketFormProps) {
    const form = useForm<CreateTicketValues>({
        resolver: zodResolver(createTicketSchema),
        defaultValues: initialData || {
            subject: '',
            priority: TicketPriority.MEDIUM,
            message: '',
        },
    });

    const handleSubmit = (values: CreateTicketValues) => {
        onSubmit(values);
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Temat</FormLabel>
                            <FormControl>
                                <Input placeholder="np. Problem z logowaniem na FTP" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Priorytet</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wybierz priorytet" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={TicketPriority.LOW}>Niski</SelectItem>
                                    <SelectItem value={TicketPriority.MEDIUM}>Średni</SelectItem>
                                    <SelectItem value={TicketPriority.HIGH}>Wysoki</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Opis Problemu</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Opisz dokładnie swój problem..."
                                    className="resize-y min-h-[150px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
                </Button>
            </form>
        </Form>
    );
}