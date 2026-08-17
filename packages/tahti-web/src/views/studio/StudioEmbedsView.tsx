import { useEffect, useState } from 'react';

import { Button, Input, Tabs } from '@nuclearplayer/ui';

import {
  addEmbed,
  fetchMyEmbeds,
  MAX_ARTIST_EMBEDS,
  removeEmbed,
  type ArtistEmbed,
} from '../../api/artist-embeds';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

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
        <StudioPageHeader
          title="Embeds"
          subtitle={`Pin up to ${MAX_ARTIST_EMBEDS} SoundCloud tracks to your public profile.`}
        />

        <Tabs
          listClassName="border-border border-b pb-3"
          panelClassName="pt-2"
          items={[
            {
              id: 'library',
              label: 'Pinned tracks',
              content: (
                <StudioPanel
                  title="Pinned tracks"
                  description={`${embeds.length} of ${MAX_ARTIST_EMBEDS} used`}
                >
                  {loading ? (
                    <p className="text-foreground-secondary text-sm">
                      Loading…
                    </p>
                  ) : embeds.length === 0 ? (
                    <p className="text-foreground-secondary text-sm">
                      No embeds yet.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {embeds.map((embed) => (
                        <li
                          key={embed.id}
                          className="border-border bg-background flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {embed.thumbnailUrl && (
                              <img
                                src={embed.thumbnailUrl}
                                alt=""
                                className="size-12 shrink-0 rounded-md object-cover"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {embed.title ?? embed.url}
                              </div>
                              {embed.authorName && (
                                <div className="text-foreground-secondary text-xs">
                                  {embed.authorName}
                                </div>
                              )}
                              <a
                                href={embed.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary block truncate text-xs hover:underline"
                              >
                                {embed.url}
                              </a>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="text"
                            onClick={() => {
                              void removeEmbed(embed.id).then((result) => {
                                if (!result.ok) {
                                  setMsg(result.error);
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
                </StudioPanel>
              ),
            },
            {
              id: 'add',
              label: 'Add embed',
              content: (
                <StudioPanel
                  title="Add embed"
                  description="Paste a public SoundCloud track URL."
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-end gap-2">
                      <Input
                        label="SoundCloud track URL"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        placeholder="https://soundcloud.com/artist/track"
                      />
                      <Button
                        size="sm"
                        disabled={
                          !url.trim() ||
                          busy ||
                          embeds.length >= MAX_ARTIST_EMBEDS
                        }
                        onClick={() => {
                          setBusy(true);
                          void addEmbed(url.trim()).then((result) => {
                            setBusy(false);
                            if (!result.ok) {
                              setMsg(result.error);
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
                  </div>
                </StudioPanel>
              ),
            },
          ]}
        />
      </div>
    </StudioGate>
  );
}
