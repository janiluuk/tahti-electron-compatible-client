import { Link } from '@tanstack/react-router';
import {
  BarChart3Icon,
  CalendarIcon,
  DiscAlbumIcon,
  DiscIcon,
  FolderLockIcon,
  LayoutTemplateIcon,
  LibraryBigIcon,
  ListMusicIcon,
  MicIcon,
  NewspaperIcon,
  PlugIcon,
  RadioIcon,
  RocketIcon,
  ScissorsIcon,
  UploadCloudIcon,
  WalletIcon,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { CardGrid } from '@nuclearplayer/ui';

import {
  fetchStudioArchive,
  fetchStudioCollections,
  fetchStudioReleases,
} from '../../api/studio';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { Eyebrow } from '../../components/tahti/Eyebrow';
import { useAuthStore } from '../../stores/authStore';

type Counts = { archive: number; releases: number; collections: number };

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2>
        <Eyebrow>{title}</Eyebrow>
      </h2>
      {children}
    </section>
  );
}

/** Colour-coded, icon-first nav tile — the label sits in a translucent
 * strip over the icon (opacity layer) so it stays legible regardless of
 * the tile's background colour, instead of plain text below an artwork
 * square like the music Card component. */
function StudioActionTile({
  to,
  icon: Icon,
  label,
  subtitle,
  color,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="group border-border relative flex aspect-[4/3] flex-col overflow-hidden rounded-xl border shadow-sm transition-transform hover:-translate-y-0.5"
      style={{ background: color }}
    >
      <div className="relative z-10 bg-black/45 px-3 py-2 backdrop-blur-sm">
        <div className="truncate text-sm font-bold text-white">{label}</div>
        {subtitle ? (
          <div className="truncate text-[11px] text-white/75">{subtitle}</div>
        ) : null}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon
          size={40}
          absoluteStrokeWidth
          strokeWidth={1.5}
          className="text-white/90 transition-transform group-hover:scale-110"
          aria-hidden
        />
      </div>
    </Link>
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
        </header>

        {!channel ? null : (
          <>
            <Group title="Broadcast">
              <CardGrid>
                <StudioActionTile
                  to="/studio/go-live"
                  icon={RadioIcon}
                  label="Go Live"
                  subtitle="Keys, signal, on-air"
                  color="var(--accent-red)"
                />
                <StudioActionTile
                  to="/studio/schedule"
                  icon={CalendarIcon}
                  label="Schedule"
                  subtitle="Next show & programme"
                  color="var(--accent-blue)"
                />
              </CardGrid>
            </Group>

            <Group title="Music">
              <CardGrid>
                <StudioActionTile
                  to="/studio/shows"
                  icon={MicIcon}
                  label="Shows"
                  subtitle="Episodes & slots"
                  color="var(--accent-purple)"
                />
                <StudioActionTile
                  to="/studio/playlists"
                  icon={ListMusicIcon}
                  label="Playlists"
                  subtitle="Public & collab"
                  color="var(--accent-cyan)"
                />
                <StudioActionTile
                  to="/studio/archive"
                  icon={LibraryBigIcon}
                  label="Music"
                  subtitle={
                    counts.archive
                      ? `${counts.archive} items`
                      : 'Archive & files'
                  }
                  color="var(--accent-orange)"
                />
                <StudioActionTile
                  to="/studio/upload"
                  icon={UploadCloudIcon}
                  label="Upload"
                  subtitle="Add audio"
                  color="var(--accent-green)"
                />
                <StudioActionTile
                  to="/studio/collections"
                  icon={DiscAlbumIcon}
                  label="Albums"
                  subtitle={
                    counts.collections
                      ? `${counts.collections} collections`
                      : 'Design & order tracks'
                  }
                  color="var(--accent-yellow)"
                />
                <StudioActionTile
                  to="/studio/releases"
                  icon={RocketIcon}
                  label="Releases"
                  subtitle={
                    counts.releases
                      ? `${counts.releases} releases`
                      : 'Share releases'
                  }
                  color="var(--primary)"
                />
              </CardGrid>
            </Group>

            <Group title="Audience & channel">
              <CardGrid>
                <StudioActionTile
                  to="/studio/updates"
                  icon={NewspaperIcon}
                  label="Updates"
                  subtitle="Posts & newsletter"
                  color="var(--accent-blue)"
                />
                <StudioActionTile
                  to="/studio/stats"
                  icon={BarChart3Icon}
                  label="Stats"
                  subtitle="Plays & downloads"
                  color="var(--accent-cyan)"
                />
                <StudioActionTile
                  to="/studio/revenue"
                  icon={WalletIcon}
                  label="Revenue"
                  subtitle="Connect & grants"
                  color="var(--accent-green)"
                />
                <StudioActionTile
                  to="/studio/channel"
                  icon={LayoutTemplateIcon}
                  label="Channel look"
                  subtitle="Design & domain"
                  color="var(--accent-purple)"
                />
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
                    <StudioActionTile
                      to="/studio/editor"
                      icon={ScissorsIcon}
                      label="Editor"
                      subtitle="Trim & process"
                      color="var(--accent-orange)"
                    />
                    <StudioActionTile
                      to="/studio/stash"
                      icon={FolderLockIcon}
                      label="Stash"
                      subtitle="Private files"
                      color="var(--accent-yellow)"
                    />
                    <StudioActionTile
                      to="/sources"
                      icon={PlugIcon}
                      label="Sources"
                      subtitle="Import services"
                      color="var(--accent-red)"
                    />
                    <StudioActionTile
                      to="/studio/recordings"
                      icon={DiscIcon}
                      label="Recordings"
                      subtitle="Past broadcasts"
                      color="var(--accent-blue)"
                    />
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
