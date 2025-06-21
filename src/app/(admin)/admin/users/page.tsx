'use client';

// Wszystkie te importy już znamy
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserForm } from './UserForm'; // Importujemy nasz nowy formularz

// --- Sekcja Logiki API, dostosowana do endpointów /users ---

interface User { id: string; email: string; role: string; isActive: boolean; createdAt: string; }
const API_URL = 'http://localhost:4000';
const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('access_token')}` });

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Nieznany błąd serwera' }));
        throw new Error(errorData.message || 'Wystąpił błąd API');
    }
    if (response.status === 204) return;
    return response.json();
};

const fetchAdminUsers = (): Promise<User[]> => fetch(`${API_URL}/users`, { headers: getAuthHeader() }).then(handleResponse);
const updateUser = ({ id, data }: { id: string; data: any }): Promise<User> => fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
}).then(handleResponse);
const deleteUser = (id: string): Promise<void> => fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: getAuthHeader() }).then(handleResponse);


// --- Główny Komponent Strony ---

export default function AdminUsersPage() {
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const queryClient = useQueryClient();

    const { data: users, isLoading, isError } = useQuery<User[]>({
        queryKey: ['admin-users'],
        queryFn: fetchAdminUsers,
    });

    const onMutationSuccess = (message: string) => {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        toast.success(message);
    };
    const onMutationError = (error: Error) => { toast.error(`Wystąpił błąd: ${error.message}`); };

    const updateMutation = useMutation({ mutationFn: updateUser, onSuccess: () => { onMutationSuccess('Użytkownik pomyślnie zaktualizowany!'); setUserToEdit(null); }, onError: onMutationError });
    const deleteMutation = useMutation({ mutationFn: deleteUser, onSuccess: () => onMutationSuccess('Użytkownik pomyślnie usunięty!'), onError: onMutationError });

    if (isLoading) return <div>Ładowanie użytkowników...</div>;
    if (isError) return <div>Wystąpił błąd podczas pobierania danych.</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Użytkownikami</h1>
            </div>
            <Card>
                <CardHeader><CardTitle>Lista Użytkowników</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>Email</TableHead><TableHead>Rola</TableHead><TableHead>Status</TableHead><TableHead>Data Rejestracji</TableHead><TableHead className="text-right">Akcje</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
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

            <Dialog open={!!userToEdit} onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edytuj Użytkownika: {userToEdit?.email}</DialogTitle>
                        {/* DODAJEMY TĘ LINIĘ */}
                        <DialogDescription>
                            Zmień poniższe dane, aby zaktualizować konto użytkownika.
                        </DialogDescription>
                    </DialogHeader>
                    <UserForm
                        initialData={userToEdit!}
                        isPending={updateMutation.isPending}
                        onSubmit={(data) => updateMutation.mutate({ id: userToEdit!.id, data })}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}