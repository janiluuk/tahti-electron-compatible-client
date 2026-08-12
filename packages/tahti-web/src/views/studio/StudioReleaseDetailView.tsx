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
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function StudioReleaseDetailView({ id }: { id: string }) {
  const [release, setRelease] = useState<StudioRelease | null>(null);
  const [description, setDescription] = useState('');
  const [spotify, setSpotify] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    const result = await patchStudioRelease(id, {
      description,
      smartLinkTargets: spotify ? { spotify } : {},
    });
    setSaving(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setRelease(result.data);
    setMessage('Saved.');
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/releases" />
        <Link
          to="/studio/releases"
          className="text-foreground-secondary -mt-2 text-xs hover:underline"
        >
          ← Releases
        </Link>
        {!release ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">
              Release not found in list.
            </p>
          </StudioPanel>
        ) : (
          <>
            <StudioPageHeader
              title={release.title}
              subtitle={`${release.state} — /r/${release.smartLinkSlug}`}
              action={
                <Button size="sm" disabled={saving} onClick={() => void save()}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              }
            />

            <StudioPanel title="Artwork">
              <div className="flex flex-wrap items-start gap-4">
                {artworkPreview ? (
                  <img
                    src={artworkPreview}
                    alt=""
                    className="border-border h-28 w-28 rounded-lg border object-cover shadow-sm"
                  />
                ) : (
                  <div className="border-border bg-background text-foreground-secondary flex h-28 w-28 items-center justify-center rounded-lg border text-xs">
                    No art
                  </div>
                )}
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                  <span className="text-foreground-secondary text-xs uppercase">
                    Upload image
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
              </div>
            </StudioPanel>

            <StudioPanel title="Details">
              <div className="flex flex-col gap-3">
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
              </div>
            </StudioPanel>

            {release.tracks && release.tracks.length > 0 && (
              <StudioPanel title="Tracks">
                <ol className="text-foreground-secondary list-decimal space-y-2 pl-5 text-sm">
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
              </StudioPanel>
            )}

            {message && <p className="text-sm">{message}</p>}

            <div className="flex flex-wrap gap-2">
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
              <Link to="/studio/distribution">
                <Button variant="text">Distribution</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </StudioGate>
  );
}
