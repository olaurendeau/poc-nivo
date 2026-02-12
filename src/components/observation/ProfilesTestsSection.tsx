"use client";

import { useCallback, useRef, useState } from "react";
import type {
  ProfileTestsJson,
  StabilityTestResult,
} from "@/types/observation";
import { uploadObservationPhotoAction } from "@/lib/cloudinary";
import { ProfileModal } from "@/components/observation/ProfileModal";

const IconProfile = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 19c1.5-3 4-5 7-5s5.5 2 7 5" />
  </svg>
);

const IconImage = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const IconLibrary = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M8 13l3-3 3 3 2-2 3 3" />
  </svg>
);

const formatTestLabel = (t: StabilityTestResult): string => {
  const scorePart =
    t.type === "PST" ? `${t.type} ${t.score}` : `${t.type}${t.score}`;
  return `${scorePart}@${t.depthCm}cm`;
};

type ProfilesTestsSectionProps = {
  value: ProfileTestsJson;
  onChange: (profileTests: ProfileTestsJson) => void;
};

export const ProfilesTestsSection = ({
  value,
  onChange,
}: ProfilesTestsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const tests = value?.stabilityTests ?? [];
  const profileImage = value?.profileImage;
  const sortedTests = [...tests].sort((a, b) => a.depthCm - b.depthCm);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleOpen();
      }
    },
    [handleOpen]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleAddTest = useCallback(
    (test: StabilityTestResult) => {
      onChange({
        ...value,
        stabilityTests: [...tests, test],
      });
    },
    [value, tests, onChange]
  );

  const handleRemoveTest = useCallback(
    (index: number) => {
      const next = [...tests];
      next.splice(index, 1);
      onChange({
        ...value,
        stabilityTests: next,
      });
    },
    [tests, value, onChange]
  );

  const handleProfileImageUpload = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.[0]) return;
      setIsUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append("file", fileList[0]);
        const result = await uploadObservationPhotoAction(formData);
        if (result.url && result.publicId) {
          onChange({
            ...value,
            profileImage: { url: result.url, publicId: result.publicId },
          });
        }
      } finally {
        setIsUploadingImage(false);
      }
    },
    [value, onChange]
  );

  const handleProfileImageRemove = useCallback(() => {
    onChange({ ...value, profileImage: undefined });
  }, [value, onChange]);

  const handleProfileImageClick = useCallback(() => {
    profileImageInputRef.current?.click();
  }, []);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">
        Profils &amp; tests
      </h2>
      <p className="mb-3 text-sm text-zinc-600">
        Tests CT, ECT, RB (Rutschblock) et PST (Propagation Saw). Plusieurs
        résultats possibles par coupe (ex. CT6SC@40cm, RB4@55cm, PST End@40cm).
      </p>

      {sortedTests.length > 0 ? (
        <ul className="mb-3 flex flex-col gap-2" role="list">
          {sortedTests.map((t, i) => (
            <li
              key={`${t.type}-${t.score}-${t.depthCm}-${i}`}
              className="flex min-h-[48px] items-center justify-between gap-2 rounded-xl bg-zinc-50 px-4 py-3"
            >
              <span className="text-sm font-medium tracking-wide text-zinc-800">
                {formatTestLabel(t)}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveTest(tests.indexOf(t))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRemoveTest(tests.indexOf(t));
                  }
                }}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                aria-label={`Supprimer ${formatTestLabel(t)}`}
                tabIndex={0}
              >
                <span aria-hidden>✕</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-white px-4 py-3 text-base font-medium text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
        aria-label="Ajouter un test"
        tabIndex={0}
      >
        <IconProfile className="h-6 w-6 shrink-0" />
        {tests.length > 0
          ? "Ajouter un autre test"
          : "Ajouter un test"}
      </button>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium text-zinc-700">
          Image du profil de neige
        </h3>
        {profileImage?.url ? (
          <div className="flex flex-col gap-2">
            <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
              <img
                src={profileImage.url}
                alt="Profil de neige"
                className="max-h-48 w-full object-contain"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleProfileImageClick}
                disabled={isUploadingImage}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleProfileImageClick();
                  }
                }}
                className="flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50"
                aria-label="Remplacer l'image du profil"
                tabIndex={0}
              >
                <IconLibrary className="h-5 w-5" />
                Remplacer
              </button>
              <button
                type="button"
                onClick={handleProfileImageRemove}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleProfileImageRemove();
                  }
                }}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border-2 border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                aria-label="Supprimer l'image du profil"
                tabIndex={0}
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleProfileImageClick}
            disabled={isUploadingImage}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleProfileImageClick();
              }
            }}
            className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-white px-4 py-3 text-base font-medium text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50"
            aria-label="Ajouter une image du profil de neige"
            tabIndex={0}
          >
            <IconImage className="h-6 w-6 shrink-0" />
            {isUploadingImage
              ? "Envoi en cours…"
              : "Ajouter une photo du profil"}
          </button>
        )}
        <input
          ref={profileImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleProfileImageUpload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <ProfileModal
        open={isOpen}
        onClose={handleClose}
        onAddTest={handleAddTest}
      />
    </section>
  );
};
