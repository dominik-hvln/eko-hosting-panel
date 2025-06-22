import Image from 'next/image'; // Użyjemy komponentu Image z Next.js

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        // Używamy siatki (grid), która na średnich ekranach (md) dzieli się na 2 kolumny
        <div className="grid h-screen grid-cols-1 md:grid-cols-2">
            {/* Lewa kolumna z formularzem, która jest widoczna zawsze */}
            <div className="flex items-center justify-center p-8">
                {children} {/* Tutaj będą renderowane nasze strony logowania/rejestracji */}
            </div>

            {/* Prawa kolumna z grafiką, ukryta na małych ekranach */}
            <div className="hidden bg-gray-100 md:flex relative">
                {/* Na razie użyjemy darmowej grafiki z Unsplash. W przyszłości możesz podmienić URL na własną. */}
                <Image
                    src="https://images.unsplash.com/photo-1657983794129-95527a7b7738?q=80&w=963&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Abstrakcyjna grafika"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
}