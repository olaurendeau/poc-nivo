"use client";

import type {
  AvalancheDetails,
  IndiceKey,
  ObservableKey,
  ObservationFormData,
  ObservablesDetails,
  OrientationKey,
  ObserverSkill,
} from "@/types/observation";
import { saveObservationAction, updateObservationAction } from "@/lib/db/actions";
import { getElevationAction } from "@/lib/elevation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IndicesSection } from "@/components/observation/IndicesSection";
import { LieuSection, type LieuState } from "@/components/observation/LieuSection";
import { ObservablesSection } from "@/components/observation/ObservablesSection";
import { OrientationRosace } from "@/components/observation/OrientationRosace";
import { ProfilesTestsSection } from "@/components/observation/ProfilesTestsSection";
import { CommentSection } from "@/components/observation/CommentSection";
import { DateSection, formatDateTimeLocal } from "@/components/observation/DateSection";
import { PhotosSection } from "@/components/observation/PhotosSection";

type ObservationFormProps = {
  initialLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  initialData?: ObservationFormData;
  observationId?: string;
};

export const ObservationForm = ({
  initialLocation,
  initialData,
  observationId,
}: ObservationFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<ObservationFormData>(() => {
    if (initialData) {
      return initialData;
    }

    return {
      latitude: initialLocation?.latitude ?? null,
      longitude: initialLocation?.longitude ?? null,
      place_name: "",
      elevation: null,
      orientations: [],
      indices: [],
      indiceDetails: {},
      observables: [],
      photos: [],
      observed_at: formatDateTimeLocal(new Date()),
      comment: "",
      profileTests: { stabilityTests: [] },
      observerName: "",
      observerSkill: null,
    };
  });
  const [elevationLoading, setElevationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = window.localStorage.getItem("observationObserver");
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        observerName?: string;
        observerSkill?: ObserverSkill | null;
      };
      setFormData((prev) => ({
        ...prev,
        observerName:
          prev.observerName && prev.observerName.trim().length > 0
            ? prev.observerName
            : parsed.observerName ?? "",
        observerSkill:
          prev.observerSkill !== undefined && prev.observerSkill !== null
            ? prev.observerSkill
            : parsed.observerSkill ?? null,
      }));
    } catch {
      // ignore parse errors
    }
  }, []);

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

  const handleObservableDetailsChange = useCallback(
    (details: ObservablesDetails | undefined) => {
      setFormData((prev) => ({
        ...prev,
        observableDetails: details,
      }));
    },
    []
  );

  const handleOrientationsChange = useCallback((orientations: OrientationKey[]) => {
    setFormData((prev) => ({ ...prev, orientations }));
  }, []);

  const handlePhotosChange = useCallback((photos: ObservationFormData["photos"]) => {
    setFormData((prev) => ({ ...prev, photos }));
  }, []);

  const handleObservedAtChange = useCallback((observed_at: string) => {
    setFormData((prev) => ({ ...prev, observed_at }));
  }, []);

  const handleCommentChange = useCallback((comment: string) => {
    setFormData((prev) => ({ ...prev, comment }));
  }, []);

  const handleProfileTestsChange = useCallback(
    (profileTests: ObservationFormData["profileTests"]) => {
      setFormData((prev) => ({
        ...prev,
        profileTests: profileTests ?? { stabilityTests: [] },
      }));
    },
    []
  );

  const handleObserverNameChange = useCallback((observerName: string) => {
    setFormData((prev) => ({
      ...prev,
      observerName,
    }));
  }, []);

  const handleObserverSkillChange = useCallback(
    (observerSkill: ObserverSkill | null) => {
      setFormData((prev) => ({
        ...prev,
        observerSkill,
      }));
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const payload = JSON.stringify({
      observerName: formData.observerName ?? "",
      observerSkill: formData.observerSkill ?? null,
    });
    window.localStorage.setItem("observationObserver", payload);
  }, [formData.observerName, formData.observerSkill]);

  const ObservablesSectionAny = ObservablesSection as any;

  const canSubmit =
    formData.latitude != null &&
    formData.longitude != null;

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!canSubmit || isSubmitting) return;
      setIsSubmitting(true);
      setSubmitError(null);

      const preparedData: ObservationFormData = {
        ...formData,
        observed_at: formData.observed_at
          ? new Date(formData.observed_at).toISOString()
          : new Date().toISOString(),
      };
      const result = observationId
        ? await updateObservationAction(observationId, preparedData)
        : await saveObservationAction(preparedData);

      if (result.ok) {
        router.push(`/observation/${observationId ?? result.id}`);
        return;
      }

      setSubmitError(result.error);
      setIsSubmitting(false);
    },
    [canSubmit, formData, isSubmitting, router, observationId]
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
        <ObservablesSectionAny
          value={formData.observables}
        onChange={handleObservablesChange}
        details={formData.observableDetails}
        onDetailsChange={handleObservableDetailsChange}
        />
        <ProfilesTestsSection
          value={formData.profileTests ?? { stabilityTests: [] }}
          onChange={handleProfileTestsChange}
        />
        <PhotosSection
          value={formData.photos}
          onChange={handlePhotosChange}
        />
        <DateSection
          value={formData.observed_at}
          onChange={handleObservedAtChange}
        />
        <CommentSection
          value={formData.comment ?? ""}
          onChange={handleCommentChange}
        />
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">
            Observateur
          </h2>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-zinc-700">
              <span className="font-medium text-zinc-800">
                Nom / pseudo de l&apos;observateur
              </span>
              <input
                type="text"
                value={formData.observerName ?? ""}
                onChange={(event) => handleObserverNameChange(event.target.value)}
                className="mt-1 min-h-[48px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500"
                placeholder="Ex. Marie, équipe BRA 73..."
                tabIndex={0}
                aria-label="Nom ou pseudo de l'observateur"
              />
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-zinc-800">
                Compétence de l&apos;observateur
              </legend>
              <div className="flex flex-col gap-2">
                {[
                  { value: "amateur" as ObserverSkill, label: "Amateur" },
                  { value: "pro" as ObserverSkill, label: "Professionnel" },
                  {
                    value: "obsNivo" as ObserverSkill,
                    label: "Observateur nivologique",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-100 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500"
                  >
                    <span>{option.label}</span>
                    <input
                      type="radio"
                      name="observerSkill"
                      value={option.value}
                      checked={formData.observerSkill === option.value}
                      onChange={() => handleObserverSkillChange(option.value)}
                      className="h-4 w-4 accent-zinc-900"
                      aria-label={option.label}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-[1000] border-t border-zinc-200 bg-zinc-50 p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {submitError ? (
          <p className="mb-2 text-center text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}
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
          {isSubmitting ? "Enregistrement…" : "Enregistrer l'observation"}
        </button>
      </div>
    </form>
  );
};
