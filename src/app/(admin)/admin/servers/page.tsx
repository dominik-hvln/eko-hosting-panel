// src/app/(admin)/admin/servers/page.tsx

'use client';

import { apiClient } from '@/lib/api-helpers';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ServerForm, formSchema, type FormValues } from './ServerForm';
import { Badge } from '@/components/ui/badge';

interface Server {
    id: string;
    name: string;
    ipAddress: string;
    sshPort: number;
    sshUser: string;
    status: string;
}

const defaultServerValues: FormValues = {
    name: '',
    ipAddress: '',
    sshPort: 22,
    sshUser: 'root',
    sshPrivateKey: '',
};

export default function AdminServersPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingServer, setEditingServer] = useState<Server | null>(null);
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultServerValues,
    });

    // Efekt do resetowania formularza, gdy otwieramy okno edycji
    useEffect(() => {
        if (isDialogOpen) {
            if (editingServer) {
                // Aby edytować klucz, musielibyśmy go pobrać. Na razie zostawiamy puste.
                // Użytkownik może wkleić nowy klucz, aby go zaktualizować.
                form.reset({
                    name: editingServer.name,
                    ipAddress: editingServer.ipAddress,
                    sshPort: editingServer.sshPort,
                    sshUser: editingServer.sshUser,
                    sshPrivateKey: '',
                });
            } else {
                form.reset(defaultServerValues);
            }
        }
    }, [editingServer, isDialogOpen, form]);

    const { data: servers, isLoading } = useQuery<Server[]>({
        queryKey: ['admin-servers'],
        queryFn: () => apiClient.get('/admin/servers'),
    });

    const onMutationSuccess = (message: string) => {
        queryClient.invalidateQueries({ queryKey: ['admin-servers'] });
        toast.success(message);
        setIsDialogOpen(false);
        setEditingServer(null);
    };

    const onMutationError = (error: Error) => {
        toast.error(`Błąd: ${error.message}`);
    };

    const createMutation = useMutation({
        mutationFn: (data: FormValues) => apiClient.post('/admin/servers', data),
        onSuccess: () => onMutationSuccess('Serwer pomyślnie dodany!'),
        onError: onMutationError,
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: Partial<FormValues> }) => apiClient.patch(`/admin/servers/${vars.id}`, vars.data),
        onSuccess: () => onMutationSuccess('Serwer pomyślnie zaktualizowany!'),
        onError: onMutationError,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/admin/servers/${id}`),
        onSuccess: () => onMutationSuccess('Serwer pomyślnie usunięty!'),
        onError: onMutationError,
    });

    const handleFormSubmit = (values: FormValues) => {
        const dataToSend = { ...values };
        // Jeśli pole klucza jest puste podczas edycji, nie wysyłamy go
        if (editingServer && !dataToSend.sshPrivateKey) {
            delete dataToSend.sshPrivateKey;
        }

        if (editingServer) {
            updateMutation.mutate({ id: editingServer.id, data: dataToSend });
        } else {
            createMutation.mutate(dataToSend);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    if (isLoading) return <div className="p-8">Ładowanie serwerów...</div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h1 className="text-3xl font-bold">Zarządzanie Pulą Serwerów</h1>
                <Button onClick={() => { setEditingServer(null); setIsDialogOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Dodaj nowy serwer
                </Button>
            </div>
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Lista Serwerów</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nazwa</TableHead>
                                <TableHead>Adres IP</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Akcje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {servers?.map((server) => (
                                <TableRow key={server.id}>
                                    <TableCell className="font-medium">{server.name}</TableCell>
                                    <TableCell>{server.ipAddress}:{server.sshPort}</TableCell>
                                    <TableCell><Badge>{server.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { setEditingServer(server); setIsDialogOpen(true); }}>Edytuj</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">Usuń</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Czy na pewno chcesz usunąć serwer?</AlertDialogTitle><AlertDialogDescription>Tej akcji nie można cofnąć.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteMutation.mutate(server.id)} className="bg-red-600 hover:bg-red-700">Usuń</AlertDialogAction>
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

            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setEditingServer(null); setIsDialogOpen(isOpen); }}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingServer ? `Edytuj Serwer: ${editingServer.name}` : 'Nowy Serwer'}</DialogTitle>
                        <DialogDescription>Wypełnij pola, aby dodać serwer do puli.</DialogDescription>
                    </DialogHeader>
                    <ServerForm onSubmit={handleFormSubmit} isPending={isPending} form={form} />
                </DialogContent>
            </Dialog>
        </div>
    );
}