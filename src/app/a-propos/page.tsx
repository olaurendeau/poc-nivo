import Link from "next/link";

export const metadata = {
  title: "À propos — Prototype Nivologie",
  description:
    "Objectif de ce prototype et ambition à terme : application de retours terrain nivologiques quantitatifs.",
};

export default function AProposPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 p-4 pb-8">
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
          À propos
        </h1>
      </header>

      <main className="flex flex-col gap-6 text-zinc-700">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-zinc-900">
            Objectif de ce prototype
          </h2>
          <p className="leading-relaxed">
            Il n’existe pas aujourd’hui d’application française dédiée aux{" "}
            <strong>retours terrain nivologiques quantitatifs</strong> — indices,
            observables, profils et tests — facilement utilisable sur le terrain
            par amateurs, professionnels et nivologues.
          </p>
          <p className="leading-relaxed">
            Ce projet Next.js est un <strong>prototype</strong> pour démontrer
            aux financeurs publics l’intérêt d’une telle application. La
            méthodologie et le jargon s’inspirent du{" "}
            <strong>Winter Journal</strong> (Ortovox & Ben Reuters).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-zinc-900">
            Ambition à terme
          </h2>
          <p className="leading-relaxed">
            À terme, l’ambition est de construire un{" "}
            <strong>cadre légal associatif</strong> incluant les différents
            acteurs du secteur (amateurs, professionnels, institutions), afin
            d’encadrer la collecte, le partage et l’usage de ces données.
          </p>
          <p className="leading-relaxed">
            L’application devra être <strong>interopérable par API</strong> avec
            les systèmes existants, pour éviter la double saisie et permettre
            une circulation fluide de l’information nivologique.
          </p>
          <p className="leading-relaxed">
            Pour les utilisateurs et utilisatrices, l’objectif concret est de
            pouvoir réaliser un <strong>retour terrain en trois clics</strong>,
            même dans des conditions compliquées (froid, gants, réseau limité),
            afin de rendre la contribution aussi simple et naturelle que
            possible.
          </p>
        </section>
      </main>
    </div>
  );
}
