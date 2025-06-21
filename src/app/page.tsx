import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-4xl font-bold">Witaj w EKO-HOSTING Panel!</h1>
        <Button>Zaloguj się</Button>
      </main>
  );
}