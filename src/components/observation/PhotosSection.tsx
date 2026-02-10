"use client";

import type { ObservationFormPhoto } from "@/types/observation";
import {
  uploadObservationPhotoAction,
  type UploadedPhoto,
} from "@/lib/cloudinary";
import { useRef, useState } from "react";

type PhotosSectionProps = {
  value: ObservationFormPhoto[];
  onChange: (photos: ObservationFormPhoto[]) => void;
};

const IconCamera = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="4" />
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

export const PhotosSection = ({ value: photos, onChange }: PhotosSectionProps) => {
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const captureInputRef = useRef<HTMLInputElement | null>(null);
  const libraryInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    const toAdd: ObservationFormPhoto[] = [];
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append("file", file);

        let result: UploadedPhoto;
        try {
          result = await uploadObservationPhotoAction(formData);
        } catch {
          continue;
        }

        if (!result.url || !result.publicId) {
          continue;
        }

        toAdd.push({
          id: result.publicId,
          url: result.url,
          publicId: result.publicId,
          comment: "",
        });
      }
      if (toAdd.length > 0) {
        onChange([...photos, ...toAdd]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCaptureClick = () => {
    captureInputRef.current?.click();
  };

  const handleLibraryClick = () => {
    libraryInputRef.current?.click();
  };

  const handleKeyDownCapture = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCaptureClick();
    }
  };

  const handleKeyDownLibrary = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLibraryClick();
    }
  };

  const handleCommentChange = (id: string, comment: string) => {
    onChange(
      photos.map((photo) =>
        photo.id === id ? { ...photo, comment } : photo
      )
    );
  };

  const handleOpenPreview = (id: string) => {
    setActivePhotoId(id);
  };

  const handleClosePreview = () => {
    setActivePhotoId(null);
  };

  const activePhoto = photos.find((p) => p.id === activePhotoId) ?? null;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">Photos</h2>
      <p className="mb-3 text-sm text-zinc-600">
        Ajoutez quelques photos de la zone ou du manteau neigeux.
      </p>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleCaptureClick}
          onKeyDown={handleKeyDownCapture}
          disabled={isUploading}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Prendre une photo avec l'appareil"
          tabIndex={0}
        >
          <IconCamera className="h-5 w-5" />
          Prendre une photo
        </button>
        <button
          type="button"
          onClick={handleLibraryClick}
          onKeyDown={handleKeyDownLibrary}
          disabled={isUploading}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Choisir une photo dans la bibliothèque"
          tabIndex={0}
        >
          <IconLibrary className="h-5 w-5" />
          Bibliothèque
        </button>
      </div>

      <input
        ref={captureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        multiple
        onChange={(e) => handleAddFiles(e.target.files)}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        multiple
        onChange={(e) => handleAddFiles(e.target.files)}
      />

      {photos.length > 0 ? (
        <div
          className="grid grid-cols-3 gap-2"
          aria-label="Photos sélectionnées"
        >
          {photos.map((photo) => (
            <figure
              key={photo.id}
              className="flex flex-col gap-1"
            >
              <button
                type="button"
                onClick={() => handleOpenPreview(photo.id)}
                className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                aria-label={`Agrandir la photo ${photo.comment ? `: ${photo.comment}` : ""}`}
              >
                <img
                  src={photo.url}
                  alt={photo.comment || "Photo d'observation"}
                  className="h-24 w-full object-cover"
                />
              </button>
              <textarea
                value={photo.comment}
                onChange={(e) =>
                  handleCommentChange(photo.id, e.target.value)
                }
                rows={2}
                className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                placeholder="Commentaire (optionnel)"
              />
            </figure>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">
          Aucune photo pour l&apos;instant.
        </p>
      )}

      {activePhoto ? (
        <div
          className="fixed inset-0 z-[2200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de la photo"
        >
          <div
            className="absolute inset-0 bg-zinc-900/70"
            aria-hidden
            onClick={handleClosePreview}
          />
          <div className="relative z-10 max-h-full w-full max-w-md overflow-hidden rounded-2xl bg-black">
            <img
              src={activePhoto.url}
              alt={activePhoto.comment || "Photo d'observation"}
              className="max-h-[70vh] w-full object-contain"
            />
            <button
              type="button"
              onClick={handleClosePreview}
              className="absolute right-3 top-3 rounded-full bg-zinc-900/80 px-3 py-1 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-zinc-100"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

