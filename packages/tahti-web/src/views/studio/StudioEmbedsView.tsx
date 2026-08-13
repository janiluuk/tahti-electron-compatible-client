import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  addEmbed,
  fetchMyEmbeds,
  MAX_ARTIST_EMBEDS,
  removeEmbed,
  type ArtistEmbed,
} from '../../api/artist-embeds';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

export function StudioEmbedsView() {
  const [embeds, setEmbeds] = useState<ArtistEmbed[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    void fetchMyEmbeds().then((r) => {
      setEmbeds(r.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/embeds" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Embeds
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Pin SoundCloud tracks to show on your public profile. Up to{' '}
            {MAX_ARTIST_EMBEDS}.
          </p>
        </div>

        <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
          <h2 className="font-display text-lg font-bold">Add embed</h2>
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label="SoundCloud track URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://soundcloud.com/artist/track"
            />
            <Button
              size="sm"
              disabled={
                !url.trim() || busy || embeds.length >= MAX_ARTIST_EMBEDS
              }
              onClick={() => {
                setBusy(true);
                void addEmbed(url.trim()).then((r) => {
                  setBusy(false);
                  if (!r.ok) {
                    setMsg(r.error);
                  } else {
                    setUrl('');
                    setMsg(null);
                    reload();
                  }
                });
              }}
            >
              Add
            </Button>
          </div>
          {msg && <p className="text-sm">{msg}</p>}
        </section>

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : embeds.length === 0 ? (
          <p className="text-foreground-secondary text-sm">No embeds yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {embeds.map((e) => (
              <li
                key={e.id}
                className="border-border flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  {e.thumbnailUrl && (
                    <img
                      src={e.thumbnailUrl}
                      alt=""
                      className="size-12 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{e.title ?? e.url}</div>
                    {e.authorName && (
                      <div className="text-foreground-secondary text-xs">
                        {e.authorName}
                      </div>
                    )}
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs hover:underline"
                    >
                      {e.url}
                    </a>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="text"
                  onClick={() => {
                    void removeEmbed(e.id).then((r) => {
                      if (!r.ok) {
                        setMsg(r.error);
                      } else {
                        reload();
                      }
                    });
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StudioGate>
  );
}
