'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export function ImpersonationBanner() {
    const [isAdminImpersonating, setIsAdminImpersonating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const adminToken = sessionStorage.getItem('original_admin_token');
        if (adminToken) {
            setIsAdminImpersonating(true);
        }
    }, []);

    const handleExitImpersonation = () => {
        const adminToken = sessionStorage.getItem('original_admin_token');
        if (adminToken) {
            localStorage.setItem('access_token', adminToken);
            sessionStorage.removeItem('original_admin_token');
            router.push('/admin'); // Przekierowujemy z powrotem do panelu admina
        }
    };

    if (!isAdminImpersonating) {
        return null; // Jeśli nie ma trybu impersonacji, nie renderuj nic
    }

    return (
        <div className="bg-yellow-400 text-yellow-900 font-semibold p-3 text-center w-full flex items-center justify-center gap-4">
            <p>Jesteś w trybie podglądu konta klienta.</p>
            <Button
                onClick={handleExitImpersonation}
                variant="outline"
                className="bg-yellow-500 hover:bg-yellow-600 border-yellow-700"
            >
                Wróć do konta admina
            </Button>
        </div>
    );
}