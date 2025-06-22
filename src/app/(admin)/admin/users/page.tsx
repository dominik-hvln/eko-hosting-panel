'use client';
import { apiClient } from '@/lib/api-helpers';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MoreHorizontal } from 'lucide-react';
import { Role } from '@/common/enums/role.enum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormMessage, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';

interface User { id: string; email: string; role: Role; isActive: boolean; createdAt: string; }

const formSchema = z.object({
    role: z.nativeEnum(Role),
    isActive: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

export default function AdminUsersPage() {
    const router = useRouter();
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

    useEffect(() => {
        if (userToEdit) {
            form.reset({ role: userToEdit.role, isActive: userToEdit.isActive });
        }
    }, [userToEdit, form]);

    const { data: users, isLoading, isError } = useQuery<User[]>({ queryKey: ['admin-users'], queryFn: () => apiClient.get('/users') });

    const onMutationSuccess = (message: string) => {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        toast.success(message);
        setUserToEdit(null);
    };
    const onMutationError = (error: Error) => { toast.error(`Wystąpił błąd: ${error.message}`); };

    const updateMutation = useMutation({ mutationFn: (vars: { id: string; data: FormValues }) => apiClient.patch(`/users/${vars.id}`, vars.data), onSuccess: () => onMutationSuccess('Użytkownik pomyślnie zaktualizowany!'), onError: onMutationError });
    const deleteMutation = useMutation({ mutationFn: (id: string) => apiClient.delete(`/users/${id}`), onSuccess: () => onMutationSuccess('Użytkownik pomyślnie usunięty!'), onError: onMutationError });

    const impersonateMutation = useMutation({
        mutationFn: (userId: string) => apiClient.post<{ access_token: string }>(`/auth/impersonate/${userId}`, {}),
        onSuccess: (data) => {
            toast.success('Pomyślnie zalogowano jako użytkownik!');
            const currentAdminToken = localStorage.getItem('access_token');
            if (currentAdminToken) {
                sessionStorage.setItem('original_admin_token', currentAdminToken);
            }
            localStorage.setItem('access_token', data.access_token);
            router.push('/dashboard');
        },
        onError: onMutationError,
    });

    const handleFormSubmit = (values: FormValues) => {
        if (userToEdit) {
            updateMutation.mutate({ id: userToEdit.id, data: values });
        }
    };

    if (isLoading) return <div className="p-8">Ładowanie użytkowników...</div>;
    if (isError) return <div className="p-8">Wystąpił błąd podczas pobierania danych.</div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Użytkownikami</h1>
            </div>
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Lista Użytkowników</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Rola</TableHead><TableHead>Status</TableHead><TableHead>Data Rejestracji</TableHead><TableHead className="text-right">Akcje</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {users?.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                    <TableCell>{user.isActive ? 'Aktywny' : 'Nieaktywny'}</TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => impersonateMutation.mutate(user.id)}>Zaloguj się jako ten użytkownik</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setUserToEdit(user)}>Edytuj</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">Usuń</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Czy na pewno chcesz usunąć tego użytkownika?</AlertDialogTitle><AlertDialogDescription>Tej akcji nie można cofnąć.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteMutation.mutate(user.id)} className="bg-red-600 hover:bg-red-700">Usuń na stałe</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!userToEdit} onOpenChange={(isOpen) => { if (!isOpen) setUserToEdit(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edytuj Użytkownika: {userToEdit?.email}</DialogTitle>
                        <DialogDescription>Zmień poniższe dane, aby zaktualizować konto.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-4">
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rola</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value={Role.USER}>Użytkownik</SelectItem>
                                            <SelectItem value={Role.EMPLOYEE}>Pracownik</SelectItem>
                                            <SelectItem value={Role.ADMIN}>Administrator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="isActive" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Konto Aktywne</FormLabel>
                                        <FormDescription>Czy użytkownik może logować się na swoje konto.</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )} />
                            <Button type="submit" disabled={updateMutation.isPending} className="w-full">
                                {updateMutation.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}