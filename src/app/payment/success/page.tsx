import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-50">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800">Płatność Zakończona Sukcesem!</h1>
            <p className="mt-4 text-lg text-gray-600">
                Dziękujemy za doładowanie. Twoje saldo zostanie zaktualizowane w ciągu kilku sekund.
            </p>
            <Link href="/dashboard/wallet" className="mt-8 px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition-colors">
                Wróć do portfela
            </Link>
        </div>
    );
}