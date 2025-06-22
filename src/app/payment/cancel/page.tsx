import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-50">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800">Płatność Anulowana</h1>
            <p className="mt-4 text-lg text-gray-600">
                Proces płatności został anulowany. Możesz spróbować ponownie w dowolnym momencie.
            </p>
            <Link href="/dashboard/wallet" className="mt-8 px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition-colors">
                Wróć do portfela
            </Link>
        </div>
    );
}