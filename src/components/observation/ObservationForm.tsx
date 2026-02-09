"use client";

import type {
  AvalancheDetails,
  IndiceKey,
  ObservableKey,
  ObservationFormData,
  OrientationKey,
} from "@/types/observation";
import { getElevationAction } from "@/lib/elevation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IndicesSection } from "@/components/observation/IndicesSection";
import { LieuSection, type LieuState } from "@/components/observation/LieuSection";
import { ObservablesSection } from "@/components/observation/ObservablesSection";
import { OrientationRosace } from "@/components/observation/OrientationRosace";

const initialFormData: ObservationFormData = {
  latitude: null,
  longitude: null,
  place_name: "",
  elevation: null,
  orientations: [],
  indices: [],
  indiceDetails: {},
  observables: [],
};

export const ObservationForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ObservationFormData>(initialFormData);
  const [elevationLoading, setElevationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData.latitude == null || formData.longitude == null) {
      return;
    }
    setElevationLoading(true);
    getElevationAction(formData.latitude, formData.longitude)
      .then(({ elevation }) => {
        setFormData((prev) => ({ ...prev, elevation }));
      })
      .finally(() => {
        setElevationLoading(false);
      });
  }, [formData.latitude, formData.longitude]);

  const lieuState: LieuState = {
    latitude: formData.latitude,
    longitude: formData.longitude,
    elevation: formData.elevation,
    elevationLoading,
  };

  const handleLieuChange = useCallback((latitude: number, longitude: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
      elevation: null,
    }));
  }, []);

  const handleIndicesChange = useCallback((indices: IndiceKey[]) => {
    setFormData((prev) => {
      const next = { ...prev, indices };
      if (!indices.includes("avalanche")) {
        next.indiceDetails = { ...prev.indiceDetails, avalanche: undefined };
      }
      return next;
    });
  }, []);

  const handleAvalancheDetailsChange = useCallback((avalanche: AvalancheDetails) => {
    setFormData((prev) => ({
      ...prev,
      indiceDetails: { ...prev.indiceDetails, avalanche },
    }));
  }, []);

  const handleObservablesChange = useCallback((observables: ObservableKey[]) => {
    setFormData((prev) => ({ ...prev, observables }));
  }, []);

  const handleOrientationsChange = useCallback((orientations: OrientationKey[]) => {
    setFormData((prev) => ({ ...prev, orientations }));
  }, []);

  const canSubmit =
    formData.latitude != null &&
    formData.longitude != null;

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!canSubmit || isSubmitting) return;
      setIsSubmitting(true);
      // TODO: appeler la Server Action d'enregistrement quand la DB sera en place
      const redirectDelayMs = 2000;
      setTimeout(() => {
        router.push("/");
      }, redirectDelayMs);
    },
    [canSubmit, isSubmitting, router]
  );

  return (
    <form className="relative" noValidate onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6 pb-28">
        <LieuSection value={lieuState} onChange={handleLieuChange} />
        <OrientationRosace
          value={formData.orientations}
          onChange={handleOrientationsChange}
        />
        <IndicesSection
          value={formData.indices}
          onChange={handleIndicesChange}
          avalancheDetails={formData.indiceDetails?.avalanche}
          onAvalancheDetailsChange={handleAvalancheDetailsChange}
        />
        <ObservablesSection
          value={formData.observables}
          onChange={handleObservablesChange}
        />
      </div>
      <div className="fixed bottom-1 left-0 right-0 z-[1000] border-t border-zinc-200 bg-zinc-50 p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {!canSubmit ? (
          <p className="mb-2 text-center text-sm text-zinc-500">
            Choisissez un lieu sur la carte pour permettre l&apos;enregistrement.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-zinc-900 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Enregistrer l'observation"
        >
          {isSubmitting ? "En cours de développement…" : "Enregistrer l'observation"}
        </button>
      </div>
    </form>
  );
};
