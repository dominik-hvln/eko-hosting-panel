'use client';

import { apiClient } from '@/lib/api-helpers';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfile {
    email: string;
    firstName: string | null;
    lastName: string | null;
}

export function UserNav() {
    const router = useRouter();

    const { data: user, isLoading } = useQuery<UserProfile>({
        queryKey: ['user-profile-nav'],
        queryFn: () => apiClient.get('/users/profile'),
        retry: false,
    });

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('original_admin_token');
        router.push('/login');
    };

    const userDisplayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email;
    const userInitial = user?.firstName?.charAt(0) || user?.email?.charAt(0) || '?';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* Zmieniamy klasy, aby pozbyć się sztywnej wysokości i użyć standardowego paddingu */}
                <Button variant="ghost" className="relative flex items-center gap-2 px-2 h-auto rounded-full">
                    {/* Zmieniamy rozmiar awatara na standardowy h-8 w-8 */}
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
            {isLoading ? '...' : userDisplayName}
          </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userDisplayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">Ustawienia</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/wallet')} className="cursor-pointer">Portfel</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                    Wyloguj się
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}