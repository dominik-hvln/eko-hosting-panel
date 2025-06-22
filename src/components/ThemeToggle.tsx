'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme();

    // --- KROK DEBUGOWANIA ---
    // Logujemy do konsoli przeglądarki, co widzi nasz komponent
    console.log('Aktualny motyw (theme):', theme);
    console.log('Motyw systemowy (systemTheme):', systemTheme);
    // --- KONIEC KROKU DEBUGOWANIA ---

    const toggleTheme = () => {
        // Ustalamy, jaki jest obecny, faktyczny motyw (jeśli jest 'system', bierzemy pod uwagę systemowy)
        const currentTheme = theme === 'system' ? systemTheme : theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        console.log(`Przełączam z ${currentTheme} na ${newTheme}`);
        setTheme(newTheme);
    };

    return (
        <Button variant="outline" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}