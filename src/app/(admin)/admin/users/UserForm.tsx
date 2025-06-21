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
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEffect } from 'react';

// Enum musi być dostępny na froncie, aby go używać
export enum Role {
    USER = 'user',
    EMPLOYEE = 'employee',
    ADMIN = 'admin',
}

const formSchema = z.object({
    email: z.string().email('Niepoprawny format email.'),
    role: z.nativeEnum(Role),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormProps {
    onSubmit: (values: FormValues) => void;
    isPending: boolean;
    initialData?: Partial<FormValues>;
}

export function UserForm({ onSubmit, isPending, initialData }: UserFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || { email: '', role: Role.USER, isActive: true },
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                {/* Pole email tylko do odczytu - nie chcemy go zmieniać w tym formularzu */}
                                <Input placeholder="email@example.com" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rola</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wybierz rolę" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={Role.USER}>Użytkownik</SelectItem>
                                    <SelectItem value={Role.EMPLOYEE}>Pracownik</SelectItem>
                                    <SelectItem value={Role.ADMIN}>Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <FormLabel>Aktywny</FormLabel>
                                <FormDescription>
                                    Czy konto użytkownika jest aktywne.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                </Button>
            </form>
        </Form>
    );
}