"use client";

import { useState } from "react";

type Photo = {
  id: string;
  url: string;
  publicId: string;
  comment: string;
};

type ObservationPhotosGalleryProps = {
  photos: Photo[];
};

export const ObservationPhotosGallery = ({
  photos,
}: ObservationPhotosGalleryProps) => {
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

  const activePhoto = photos.find((p) => p.id === activePhotoId) ?? null;

  const handleOpen = (id: string) => {
    setActivePhotoId(id);
  };

  const handleClose = () => {
    setActivePhotoId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <figure key={photo.id} className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleOpen(photo.id)}
              className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
              aria-label={`Agrandir la photo ${photo.comment ? `: ${photo.comment}` : ""}`}
              tabIndex={0}
            >
              <img
                src={photo.url}
                alt={photo.comment || "Photo d'observation"}
                className="h-36 w-full object-cover sm:h-40"
              />
            </button>
            {photo.comment ? (
              <figcaption className="line-clamp-2 text-xs text-zinc-600">
                {photo.comment}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {activePhoto ? (
        <div
          className="fixed inset-0 z-[2200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de la photo"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div
            className="absolute inset-0 bg-zinc-900/85"
            aria-hidden
            onClick={handleClose}
          />
          <div className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <img
              src={activePhoto.url}
              alt={activePhoto.comment || "Photo d'observation"}
              className="max-h-[85vh] w-full object-contain"
            />
            {activePhoto.comment ? (
              <p className="absolute bottom-0 left-0 right-0 bg-zinc-900/90 px-4 py-3 text-sm text-white">
                {activePhoto.comment}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-100"
              aria-label="Fermer l'aperçu"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
