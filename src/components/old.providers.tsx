'use client'; // Ten komponent musi działać po stronie klienta

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Tworzymy jedną, globalną instancję klienta
const queryClient = new QueryClient();

// Nasz komponent-dostawca, który "owinie" całą aplikację
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}