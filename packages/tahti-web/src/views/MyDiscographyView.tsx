import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { Button, SectionShell } from '@nuclearplayer/ui';

import { fetchProfile } from '../api/client';
import type { PublicProfile, TahtiPlayable } from '../api/types';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { ReleasesPanel } from '../components/ReleasesPanel';
import { TrackEditDialog } from '../components/TrackEditDialog';
import { archiveItemIdFromPlayableId } from '../lib/archiveId';
import { useAuthStore } from '../stores/authStore';
import { profileTrackToPlayable } from './ArtistView';

export function MyDiscographyView() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);

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

  const artist = profile?.artist.displayName ?? '';
  const slug = profile?.channel?.slug;

  const catalogPlayables = useMemo(() => {
    if (!profile) {
      return [];
    }
    return profile.tracks
      .map((t) => profileTrackToPlayable(t, artist, slug))
      .filter((p): p is TahtiPlayable => Boolean(p));
  }, [profile, artist, slug]);

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

  return (
    <div className="flex flex-col gap-6">
      <SectionShell title="Releases">
        <ReleasesPanel
          releases={profile.releases}
          artist={artist}
          slug={slug}
        />
      </SectionShell>

      <SectionShell title="Catalog">
        <PlayableTrackTable
          items={catalogPlayables}
          emptyMessage="No playable tracks yet."
          onEdit={(item) =>
            setEditingArchiveId(archiveItemIdFromPlayableId(item.id))
          }
        />
      </SectionShell>

      <TrackEditDialog
        archiveItemId={editingArchiveId}
        onClose={() => setEditingArchiveId(null)}
        onSaved={() => {
          if (user?.username) {
            void fetchProfile(user.username).then((res) =>
              setProfile(res.data),
            );
          }
        }}
      />
    </div>
  );
}
