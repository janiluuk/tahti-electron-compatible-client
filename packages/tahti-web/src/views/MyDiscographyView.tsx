import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Card, CardGrid, SectionShell } from '@nuclearplayer/ui';

import { fetchProfile } from '../api/client';
import type { PublicProfile, TahtiPlayable } from '../api/types';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { useAuthStore } from '../stores/authStore';
import { profileTrackToPlayable } from './ArtistView';

export function MyDiscographyView() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.username) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchProfile(user.username).then((res) => {
      if (!cancelled) {
        setProfile(res.data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.username]);

  if (!user?.channel) {
    return (
      <PageEmpty
        title="No discography yet"
        description="Go live or upload a release to get an artist channel — your releases and catalog will show up here."
        action={
          <Link to="/studio/go-live">
            <Button size="sm" variant="secondary">
              Go to Studio
            </Button>
          </Link>
        }
      />
    );
  }

  if (loading) {
    return <PageLoading label="Loading your discography…" />;
  }

  if (!profile) {
    return <p className="text-sm">Couldn&apos;t load your discography.</p>;
  }

  const artist = profile.artist.displayName;
  const slug = profile.channel?.slug;
  const catalogPlayables = profile.tracks
    .map((t) => profileTrackToPlayable(t, artist, slug))
    .filter((p): p is TahtiPlayable => Boolean(p));

  return (
    <div className="flex flex-col gap-6">
      <SectionShell title="Releases">
        {profile.releases.length === 0 ? (
          <PageEmpty
            title="No releases yet"
            description="Publish a release in Studio to see it here."
            action={
              <Link to="/studio/releases">
                <Button size="sm" variant="secondary">
                  Studio → Releases
                </Button>
              </Link>
            }
          />
        ) : (
          <CardGrid>
            {profile.releases.map((rel) => (
              <div key={rel.id} className="flex flex-col gap-2">
                {rel.smartLinkSlug ? (
                  <Link to="/r/$slug" params={{ slug: rel.smartLinkSlug }}>
                    <Card
                      title={rel.title}
                      subtitle={rel.type ?? 'Release'}
                      src={rel.artworkUrl ?? undefined}
                    />
                  </Link>
                ) : (
                  <Card
                    title={rel.title}
                    subtitle={rel.type ?? 'Release'}
                    src={rel.artworkUrl ?? undefined}
                  />
                )}
              </div>
            ))}
          </CardGrid>
        )}
      </SectionShell>

      <SectionShell title="Catalog">
        <PlayableTrackTable
          items={catalogPlayables}
          emptyMessage="No playable tracks yet."
        />
      </SectionShell>
    </div>
  );
}
