// src/app/(admin)/admin/servers/ServerForm.tsx

'use client';

import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

export const formSchema = z.object({
    name: z.string().min(3, { message: 'Nazwa musi mieć co najmniej 3 znaki.' }),
    ipAddress: z.string().ip({ version: "v4", message: "Proszę podać poprawny adres IP." }),
    sshPort: z.coerce.number().int().min(1).max(65535).default(22),
    sshUser: z.string().min(1, { message: 'Nazwa użytkownika jest wymagana.' }).default('root'),
    sshPrivateKey: z.string().min(10, { message: 'Klucz prywatny jest wymagany.' }),
});

export type FormValues = z.infer<typeof formSchema>;

interface ServerFormProps {
    onSubmit: (values: FormValues) => void;
    isPending: boolean;
    form: UseFormReturn<FormValues>;
}

export function ServerForm({ onSubmit, isPending, form }: ServerFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nazwa Serwera</FormLabel>
                            <FormControl>
                                <Input placeholder="np. web-01-frankfurt" {...field} />
                            </FormControl>
                            <FormDescription>Przyjazna nazwa do identyfikacji serwera.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="ipAddress"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Adres IP</FormLabel>
                                <FormControl>
                                    <Input placeholder="123.45.67.89" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sshPort"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Port SSH</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="sshUser"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Użytkownik SSH</FormLabel>
                            <FormControl>
                                <Input placeholder="root" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="sshPrivateKey"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Klucz Prywatny SSH</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
                                    className="font-mono h-48 resize-y"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Klucz zostanie zaszyfrowany przed zapisaniem w bazie.</FormDescription>
                            <FormMessage />
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