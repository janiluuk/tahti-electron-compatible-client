import { Link } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';

import { Button, Card, CardGrid } from '@nuclearplayer/ui';

import {
  fetchStudioArchive,
  fetchStudioCollections,
  fetchStudioReleases,
} from '../../api/studio';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { useAuthStore } from '../../stores/authStore';

type Counts = { archive: number; releases: number; collections: number };

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-sm font-bold tracking-wide uppercase opacity-70">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function StudioHomeView() {
  const user = useAuthStore((s) => s.user);
  const [counts, setCounts] = useState<Counts>({
    archive: 0,
    releases: 0,
    collections: 0,
  });
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!user?.channel) {
      return;
    }
    void Promise.all([
      fetchStudioArchive(),
      fetchStudioReleases(),
      fetchStudioCollections(),
    ]).then(([a, r, c]) => {
      setCounts({
        archive: a.data.length,
        releases: r.data.releases.length,
        collections: c.data.length,
      });
    });
  }, [user?.channel]);

  const channel = user?.channel;

  return (
    <StudioGate requireChannel={false}>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <StudioNav current="/studio" />

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Studio
            </h1>
            {channel ? (
              <p className="text-foreground-secondary mt-1 text-sm">
                <span className="text-foreground font-medium">
                  {user.displayName || channel.slug}
                </span>
                <span className="opacity-60"> /{channel.slug}</span>
                <span className="ml-2 text-xs tracking-wide uppercase opacity-70">
                  {channel.state}
                </span>
              </p>
            ) : (
              <p className="text-foreground-secondary mt-1 text-sm">
                <Link
                  to="/studio/setup-channel"
                  className="text-foreground underline-offset-2 hover:underline"
                >
                  Create your channel
                </Link>{' '}
                to unlock Music and Go Live.
              </p>
            )}
          </div>
          {channel && (
            <Link to="/studio/go-live">
              <Button>Go Live</Button>
            </Link>
          )}
        </header>

        {!channel ? null : (
          <>
            <Group title="Broadcast">
              <CardGrid>
                <Link to="/studio/go-live">
                  <Card title="Go Live" subtitle="Keys, signal, on-air" />
                </Link>
                <Link to="/studio/schedule">
                  <Card title="Schedule" subtitle="Next show & programme" />
                </Link>
              </CardGrid>
            </Group>

            <Group title="Music">
              <CardGrid>
                <Link to="/studio/shows">
                  <Card title="Shows" subtitle="Episodes & slots" />
                </Link>
                <Link to="/studio/playlists">
                  <Card title="Playlists" subtitle="Public & collab" />
                </Link>
                <Link to="/studio/archive">
                  <Card
                    title="Music"
                    subtitle={
                      counts.archive
                        ? `${counts.archive} items`
                        : 'Archive & files'
                    }
                  />
                </Link>
                <Link to="/studio/upload">
                  <Card title="Upload" subtitle="Add audio" />
                </Link>
                <Link to="/studio/collections">
                  <Card
                    title="Albums"
                    subtitle={
                      counts.collections
                        ? `${counts.collections} collections`
                        : 'Design & order tracks'
                    }
                  />
                </Link>
                <Link to="/studio/releases">
                  <Card
                    title="Releases"
                    subtitle={
                      counts.releases
                        ? `${counts.releases} releases`
                        : 'Share releases'
                    }
                  />
                </Link>
              </CardGrid>
            </Group>

            <Group title="Audience & channel">
              <CardGrid>
                <Link to="/studio/updates">
                  <Card title="Updates" subtitle="Posts & newsletter" />
                </Link>
                <Link to="/studio/stats">
                  <Card title="Stats" subtitle="Plays & downloads" />
                </Link>
                <Link to="/studio/revenue">
                  <Card title="Revenue" subtitle="Connect & grants" />
                </Link>
                <Link to="/studio/channel">
                  <Card title="Channel look" subtitle="Design & domain" />
                </Link>
              </CardGrid>
            </Group>

            <div>
              <button
                type="button"
                className="text-foreground-secondary hover:text-foreground text-sm underline-offset-2 hover:underline"
                onClick={() => setShowMore((v) => !v)}
                aria-expanded={showMore}
              >
                {showMore ? 'Hide more tools' : 'More tools'}
              </button>
              {showMore && (
                <div className="mt-3">
                  <CardGrid>
                    <Link to="/studio/editor">
                      <Card title="Editor" subtitle="Trim & process" />
                    </Link>
                    <Link to="/studio/stash">
                      <Card title="Stash" subtitle="Private files" />
                    </Link>
                    <Link to="/sources">
                      <Card title="Sources" subtitle="Import services" />
                    </Link>
                  </CardGrid>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </StudioGate>
  );
}
