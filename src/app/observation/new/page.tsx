import { ObservationForm } from "@/components/observation/ObservationForm";
import Link from "next/link";

export default function NewObservationPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 p-4">
      <header className="mb-6">
        <Link
          href="/"
          className="inline-flex min-h-[48px] min-w-[48px] items-center gap-2 text-zinc-600 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          tabIndex={0}
          aria-label="Retour à la carte"
        >
          ← Retour
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          Nouvelle observation
        </h1>
      </header>
      <ObservationForm />
    </div>
  );
}
