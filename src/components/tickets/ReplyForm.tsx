'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Schemat walidacji dla pojedynczej wiadomości
const formSchema = z.object({
    content: z.string().min(1, 'Wiadomość nie może być pusta.'),
});

type FormValues = z.infer<typeof formSchema>;

interface ReplyFormProps {
    onSubmit: (values: FormValues) => void;
    isPending: boolean;
}

export function ReplyForm({ onSubmit, isPending }: ReplyFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: '',
        },
    });

    const handleSubmit = (values: FormValues) => {
        onSubmit(values);
        // Czyścimy formularz po wysłaniu
        form.reset();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Twoja odpowiedź</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Napisz swoją odpowiedź..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Wysyłanie...' : 'Wyślij odpowiedź'}
                </Button>
            </form>
        </Form>
    );
}