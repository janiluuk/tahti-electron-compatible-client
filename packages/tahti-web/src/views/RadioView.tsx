import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Box, Button } from '@nuclearplayer/ui';

import { fetchRadio, type FetchMeta } from '../api/client';
import type { RadioNowPlaying } from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { usePlayerStore } from '../stores/playerStore';

export function RadioView() {
  const [radio, setRadio] = useState<RadioNowPlaying | null>(null);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const play = usePlayerStore((s) => s.play);

  const reload = () => {
    setLoading(true);
    void fetchRadio().then((res) => {
      setRadio(res.data);
      setMeta(res.meta);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <PageFrame maxWidth="2xl">
      <PageHeader
        title="Tahti Radio"
        subtitle="Org meta-stream of whichever channels are live — no editorial curation."
        meta={
          meta
            ? `Source: ${meta.source}${meta.reason ? ` (${meta.reason})` : ''}`
            : undefined
        }
      />

      {loading ? (
        <PageLoading label="Checking radio…" />
      ) : radio?.live && radio.channel ? (
        <Box variant="secondary" className="flex flex-col gap-4">
          <div>
            <div className="text-foreground-secondary text-xs uppercase">
              On air
            </div>
            <div className="text-foreground mt-1 text-xl font-bold">
              {radio.channel.displayName ?? radio.channel.slug}
            </div>
            {radio.channel.title && (
              <div className="text-foreground-secondary text-sm">
                {radio.channel.title}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                void fetchRadio().then(({ playable }) => {
                  if (playable) {
                    play(playable);
                  }
                });
              }}
            >
              Play Radio
            </Button>
            <Link to="/channel/$slug" params={{ slug: radio.channel.slug }}>
              <Button size="sm" variant="secondary">
                Open channel
              </Button>
            </Link>
          </div>
        </Box>
      ) : (
        <PageEmpty
          icon="radio"
          title="Radio is offline"
          description="No live relay right now. Try again when someone is on air."
          action={
            <Button size="sm" variant="secondary" onClick={reload}>
              Refresh
            </Button>
          }
        />
      )}
    </PageFrame>
  );
}
