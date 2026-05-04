import { ObservationForm } from "@/components/observation/ObservationForm";
import { PageContainer } from "@/components/PageContainer";
import Link from "next/link";

type NewObservationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewObservationPage({
  searchParams,
}: NewObservationPageProps) {
  const params = await searchParams;

  const latParam = params.lat;
  const lngParam = params.lng;

  const initialLatitude =
    typeof latParam === "string" ? Number(latParam) : null;
  const initialLongitude =
    typeof lngParam === "string" ? Number(lngParam) : null;

  const hasInitialLocation =
    initialLatitude != null &&
    !Number.isNaN(initialLatitude) &&
    initialLongitude != null &&
    !Number.isNaN(initialLongitude);

  const initialLocation = hasInitialLocation
    ? { latitude: initialLatitude, longitude: initialLongitude }
    : null;

  return (
    <PageContainer>
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
      <ObservationForm initialLocation={initialLocation} />
    </PageContainer>
  );
}
