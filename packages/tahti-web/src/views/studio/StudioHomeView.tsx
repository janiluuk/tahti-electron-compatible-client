import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Card, CardGrid } from '@nuclearplayer/ui';

import {
  fetchStudioArchive,
  fetchStudioCollections,
  fetchStudioReleases,
} from '../../api/studio';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { useAuthStore } from '../../stores/authStore';

export function StudioHomeView() {
  const user = useAuthStore((s) => s.user);
  const [counts, setCounts] = useState({
    archive: 0,
    releases: 0,
    collections: 0,
  });
  const [source, setSource] = useState('…');

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
      setSource(a.meta.source);
    });
  }, [user?.channel]);

  return (
    <StudioGate requireChannel={false}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <StudioNav current="/studio" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Studio
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Nuclear chrome for artist catalog + audio editor. Data from{' '}
            <code>/api/me/*</code> (source: {source}).
          </p>
          {user?.channel && (
            <p className="text-foreground-secondary mt-1 text-xs">
              Channel <code>/{user.channel.slug}</code> — {user.channel.state}
            </p>
          )}
        </div>

        {user?.channel && (
          <div className="border-primary/40 bg-primary/10 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
            <div>
              <div className="font-display text-lg font-bold">Go Live</div>
              <p className="text-foreground-secondary text-sm">
                Copy OBS/Icecast keys, confirm signal, hit Go Live — then play
                your channel here.
              </p>
            </div>
            <Link to="/studio/go-live">
              <Button>Go Live</Button>
            </Link>
          </div>
        )}

        {!user?.channel ? (
          <p className="text-foreground-secondary text-sm">
            No channel on this account — Music / Upload stay gated until you
            provision one on production.
          </p>
        ) : (
          <CardGrid>
            <Link to="/studio/go-live">
              <Card
                title="Go Live"
                subtitle={`Channel ${user.channel.state}`}
              />
            </Link>
            <Link to="/studio/archive">
              <Card title="Archive" subtitle={`${counts.archive} items`} />
            </Link>
            <Link to="/studio/releases">
              <Card
                title="Releases"
                subtitle={`${counts.releases} smart links`}
              />
            </Link>
            <Link to="/studio/collections">
              <Card
                title="Collections"
                subtitle={`${counts.collections} playlists`}
              />
            </Link>
            <Link to="/studio/editor">
              <Card title="Audio editor" subtitle="Projects + pro trim/cut" />
            </Link>
            <Link to="/studio/upload">
              <Card title="Upload" subtitle="Prepare → PUT → complete" />
            </Link>
            <Link to="/studio/schedule">
              <Card title="Schedule" subtitle="Next show + programme" />
            </Link>
            <Link to="/studio/stats">
              <Card title="Stats" subtitle="Plays & downloads" />
            </Link>
            <Link to="/studio/updates">
              <Card title="Updates" subtitle="Posts & newsletter" />
            </Link>
            <Link to="/studio/revenue">
              <Card title="Revenue" subtitle="Connect + grants" />
            </Link>
            <Link to="/studio/channel">
              <Card title="Channel design" subtitle="Look, profile, domain" />
            </Link>
            <Link to="/studio/stash">
              <Card title="Stash" subtitle="Private files" />
            </Link>
            <Link to="/sources">
              <Card title="Sources" subtitle="Import integrations" />
            </Link>
          </CardGrid>
        )}

        <div className="flex flex-wrap gap-2">
          <Link to="/studio/go-live">
            <Button size="sm">Go Live</Button>
          </Link>
          <Link to="/studio/upload">
            <Button size="sm" variant="secondary">
              Upload
            </Button>
          </Link>
          <Link to="/sources">
            <Button size="sm" variant="secondary">
              Sources
            </Button>
          </Link>
          <a
            href="https://tahti.live/dashboard"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" variant="text">
              Full production dashboard
            </Button>
          </a>
        </div>
      </div>
    </StudioGate>
  );
}
