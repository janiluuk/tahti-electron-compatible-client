import { ImagePlusIcon, Trash2Icon } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  deletePressKitImage,
  uploadPressKitImages,
  type PublicPressKitImage,
} from '../api/artist-settings';

const ACCEPTED = 'image/jpeg,image/png,image/webp';

type Props = {
  images: PublicPressKitImage[];
  isOwner: boolean;
  onChange: (next: PublicPressKitImage[]) => void;
};

export function ArtistGalleryPanel({ images, isOwner, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length || !isOwner) {
      return;
    }
    setBusy(true);
    setError(null);
    const result = await uploadPressKitImages(files);
    setBusy(false);
    if (result.images.length > 0) {
      onChange([...images, ...result.images]);
    }
    if (result.errors.length > 0) {
      setError(result.errors.join('; '));
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function onDelete(id: string) {
    if (!isOwner) {
      return;
    }
    const prev = images;
    onChange(images.filter((i) => i.id !== id));
    const res = await deletePressKitImage(id);
    if (!res.ok) {
      onChange(prev);
      setError(res.error);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-foreground-secondary text-sm">
          {images.length === 0
            ? 'No gallery photos yet.'
            : `${images.length} photo${images.length === 1 ? '' : 's'}`}
        </p>
        {isOwner ? (
          <>
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlusIcon size={14} className="mr-1.5" />
              {busy ? 'Uploading…' : 'Add images'}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              multiple
              className="hidden"
              onChange={(e) => void onFiles(e.target.files)}
            />
          </>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, index) => (
            <li
              key={img.id}
              className="border-border group relative overflow-hidden rounded-lg border"
            >
              <button
                type="button"
                className="block w-full"
                onClick={() => setLightbox(index)}
                aria-label={img.title ?? 'View photo'}
              >
                <img
                  src={img.imageUrl}
                  alt={img.title ?? ''}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
              </button>
              {img.title ? (
                <p className="text-foreground-secondary truncate px-2 py-1 text-xs">
                  {img.title}
                </p>
              ) : null}
              {isOwner ? (
                <button
                  type="button"
                  className="bg-background/80 text-foreground absolute top-1.5 right-1.5 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  title="Remove photo"
                  aria-label="Remove photo"
                  onClick={() => void onDelete(img.id)}
                >
                  <Trash2Icon size={14} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {lightbox !== null && images[lightbox] ? (
        <div
          className="bg-background/90 fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={images[lightbox]?.title ?? 'Gallery photo'}
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setLightbox(null);
            }
          }}
        >
          <button
            type="button"
            className="text-foreground absolute top-4 right-4 text-sm underline-offset-2 hover:underline"
            onClick={() => setLightbox(null)}
          >
            Close
          </button>
          <img
            src={images[lightbox]!.imageUrl}
            alt={images[lightbox]!.title ?? ''}
            className="max-h-[85vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}

/** Owner-only control to start a gallery when none exists yet. */
export function ArtistGalleryAddIcon({
  onCreated,
}: {
  onCreated: (images: PublicPressKitImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }
    setBusy(true);
    setError(null);
    const result = await uploadPressKitImages(files);
    setBusy(false);
    if (result.images.length > 0) {
      onCreated(result.images);
    }
    if (result.errors.length > 0) {
      setError(result.errors.join('; '));
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        disabled={busy}
        title={busy ? 'Uploading…' : 'Add gallery images'}
        aria-label={busy ? 'Uploading gallery images' : 'Add gallery images'}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlusIcon size={16} />
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={(e) => void onFiles(e.target.files)}
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
