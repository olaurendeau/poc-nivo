import Link from "next/link";

type ObservationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ObservationPage({ params }: ObservationPageProps) {
  const { id } = await params;
  // TODO: charger l'observation depuis la DB
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
          Observation {id}
        </h1>
      </header>
      <p className="text-zinc-600">
        Détail de l&apos;observation à venir (lecture seule).
      </p>
    </div>
  );
}
