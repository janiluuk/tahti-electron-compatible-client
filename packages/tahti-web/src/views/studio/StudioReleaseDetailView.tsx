import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchStudioReleases,
  patchStudioRelease,
  uploadReleaseArtwork,
} from '../../api/studio';
import type { StudioRelease } from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

export function StudioReleaseDetailView({ id }: { id: string }) {
  const [release, setRelease] = useState<StudioRelease | null>(null);
  const [description, setDescription] = useState('');
  const [spotify, setSpotify] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

  useEffect(() => {
    void fetchStudioReleases().then((res) => {
      const found = res.data.releases.find((r) => r.id === id) ?? null;
      setRelease(found);
      setDescription(found?.description ?? '');
      setSpotify(found?.smartLinkTargets?.spotify ?? '');
      setArtworkPreview(found?.artworkUrl ?? null);
    });
  }, [id]);

  const save = async () => {
    setMessage(null);
    const result = await patchStudioRelease(id, {
      description,
      smartLinkTargets: spotify ? { spotify } : {},
    });
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setRelease(result.data);
    setMessage('Saved.');
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <StudioNav current="/studio/releases" />
        <Link
          to="/studio/releases"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Releases
        </Link>
        {!release ? (
          <p className="text-foreground-secondary text-sm">
            Release not found in list.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-4">
              {artworkPreview && (
                <img
                  src={artworkPreview}
                  alt=""
                  className="border-border h-28 w-28 rounded-lg border object-cover"
                />
              )}
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight">
                  {release.title}
                </h1>
                <p className="text-foreground-secondary mt-1 text-xs">
                  {release.state} — /r/{release.smartLinkSlug}
                </p>
              </div>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground-secondary text-xs uppercase">
                Artwork
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  void uploadReleaseArtwork(id, file).then((r) => {
                    if (!r.ok) {
                      setMessage(r.error);
                    } else {
                      setArtworkPreview(r.artworkUrl);
                      setMessage('Artwork uploaded.');
                    }
                  });
                }}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground-secondary text-xs uppercase">
                Description
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-border bg-background focus:border-primary rounded-md border px-3 py-2 outline-none"
              />
            </label>
            <Input
              label="Spotify URL (smart link target)"
              value={spotify}
              onChange={(e) => setSpotify(e.target.value)}
            />
            {release.tracks && release.tracks.length > 0 && (
              <ol className="text-foreground-secondary list-decimal space-y-1 pl-5 text-sm">
                {release.tracks.map((t) => (
                  <li key={t.id}>
                    {t.title}
                    {t.archiveItemId && (
                      <>
                        {' '}
                        <Link
                          to="/studio/archive/$id/editor"
                          params={{ id: t.archiveItemId }}
                          className="underline"
                        >
                          editor
                        </Link>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {message && <p className="text-sm">{message}</p>}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void save()}>Save</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  void patchStudioRelease(id, { state: 'PUBLISHED' }).then(
                    (r) => {
                      if (!r.ok) {
                        setMessage(r.error);
                      } else {
                        setRelease(r.data);
                        setMessage('Published.');
                      }
                    },
                  );
                }}
              >
                Publish
              </Button>
              <Link to="/r/$slug" params={{ slug: release.smartLinkSlug }}>
                <Button variant="text">Open smart link</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </StudioGate>
  );
}
