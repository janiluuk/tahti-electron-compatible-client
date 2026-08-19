import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchProfile } from '../api/client';
import type { PublicProfile } from '../api/types';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { ReleasesPanel } from '../components/ReleasesPanel';
import { useAuthStore } from '../stores/authStore';

/** Library → Releases: just the release table on its own, for quickly
 * jumping to an album/EP without the catalog list underneath it. */
export function MyReleasesView() {
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
        title="No releases yet"
        description="Go live or upload a release to get an artist channel — your releases will show up here."
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
    return <PageLoading label="Loading your releases…" />;
  }

  if (!profile) {
    return <p className="text-sm">Couldn&apos;t load your releases.</p>;
  }

  return (
    <ReleasesPanel
      releases={profile.releases}
      artist={profile.artist.displayName}
      slug={profile.channel?.slug}
    />
  );
}
