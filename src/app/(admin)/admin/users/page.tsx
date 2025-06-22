'use client';
import { apiClient } from '@/lib/api-helpers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Role } from '@/common/enums/role.enum';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MoreHorizontal } from 'lucide-react';
import {FormMessage} from "@/components/ui/form"
import {Badge} from "@/components/ui/badge";

interface User { id: string; email: string; role: Role; isActive: boolean; createdAt: string; }

const formSchema = z.object({
    role: z.nativeEnum(Role),
    isActive: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

export default function AdminUsersPage() {
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const queryClient = useQueryClient();

    const { data: users, isLoading, isError } = useQuery<User[]>({ queryKey: ['admin-users'], queryFn: () => apiClient.get('/users') });
    const { mutate: updateUser, isPending: isUpdating } = useMutation({ mutationFn: (vars: {id: string, data: FormValues}) => apiClient.patch(`/users/${vars.id}`, vars.data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Użytkownik zaktualizowany!'); setUserToEdit(null); }, onError: (e: Error) => toast.error(e.message) });
    const { mutate: deleteUser } = useMutation({ mutationFn: (id: string) => apiClient.delete(`/users/${id}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Użytkownik usunięty!'); }, onError: (e: Error) => toast.error(e.message) });

    const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

    useEffect(() => {
        if (userToEdit) {
            form.reset({ role: userToEdit.role, isActive: userToEdit.isActive });
        }
    }, [userToEdit, form]);

    const handleFormSubmit = (values: FormValues) => {
        if (userToEdit) {
            updateUser({ id: userToEdit.id, data: values });
        }
    };

    if (isLoading) return <div>Ładowanie użytkowników...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania danych.</div>;

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
                                                <DropdownMenuItem onClick={() => setUserToEdit(user)}>Edytuj</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">Usuń</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Czy na pewno chcesz usunąć tego użytkownika?</AlertDialogTitle><AlertDialogDescription>Tej akcji nie można cofnąć.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteUser(mutate(user.id))} className="bg-red-600 hover:bg-red-700">Usuń na stałe</AlertDialogAction>
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
                    <DialogHeader><DialogTitle>Edytuj Użytkownika: {userToEdit?.email}</DialogTitle><DialogDescription>Zmień poniższe dane, aby zaktualizować konto.</DialogDescription></DialogHeader>
                    <Form {...form}><form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                        <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Rola</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value={Role.USER}>Użytkownik</SelectItem><SelectItem value={Role.ADMIN}>Administrator</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="isActive" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Aktywny</FormLabel><FormDescription>Czy konto może się logować.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                        <Button type="submit" disabled={isUpdating}>{isUpdating ? 'Zapisywanie...' : 'Zapisz zmiany'}</Button>
                    </form></Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}