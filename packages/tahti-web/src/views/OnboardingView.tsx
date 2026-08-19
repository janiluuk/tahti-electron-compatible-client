import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button, Input, Tabs, Toggle } from '@nuclearplayer/ui';

import {
  fetchDiscoveryPrefs,
  patchDiscoveryPrefs,
} from '../api/artist-settings';
import { checkSlugAvailable, updateChannelSlug } from '../api/channel-design';
import { provisionChannel } from '../api/channel-provision';
import { fetchMeProfile, patchMeProfile } from '../api/studio-extras';
import { GenrePicker } from '../components/GenrePicker';
import { COUNTRIES } from '../lib/countries';
import { formatGenreTags, MAX_GENRES, parseGenreTags } from '../lib/genres';
import { useAuthStore } from '../stores/authStore';

const ONBOARDED_KEY_PREFIX = 'tahti-web-onboarded:';

export function markOnboardingSeen(userId: string) {
  try {
    localStorage.setItem(`${ONBOARDED_KEY_PREFIX}${userId}`, '1');
  } catch {
    // Private-browsing/storage-disabled — worst case onboarding shows again.
  }
}

export function hasSeenOnboarding(userId: string): boolean {
  try {
    return localStorage.getItem(`${ONBOARDED_KEY_PREFIX}${userId}`) === '1';
  } catch {
    return true;
  }
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function OnboardingView() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refresh);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [bio, setBio] = useState('');
  const [artistKind, setArtistKind] = useState<'SINGLE' | 'COLLECTIVE'>(
    'SINGLE',
  );

  const [countryCode, setCountryCode] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');

  const [genres, setGenres] = useState<string[]>([]);

  const [showFollowers, setShowFollowers] = useState(true);
  const [showFollowing, setShowFollowing] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);
  const [announceReleases, setAnnounceReleases] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }
    void Promise.all([fetchMeProfile(), fetchDiscoveryPrefs()]).then(
      ([profile, discovery]) => {
        setDisplayName(profile.data.displayName || user.displayName || '');
        setPronouns(profile.data.pronouns ?? '');
        setBio(profile.data.bio ?? '');
        setArtistKind(profile.data.artistKind ?? 'SINGLE');
        setCountryCode(profile.data.countryCode ?? '');
        setDefaultLocation(profile.data.defaultLocation ?? '');
        setShowFollowers(profile.data.showFollowers ?? true);
        setShowFollowing(profile.data.showFollowing ?? true);
        setSlug(user.channel?.slug ?? user.username);
        setGenres(
          parseGenreTags(discovery.data.genreTags).slice(0, MAX_GENRES),
        );
        setShowFavorites(discovery.data.showFavorites ?? true);
        setAnnounceReleases(discovery.data.announceReleases ?? true);
        setLoading(false);
      },
    );
  }, [user]);

  const slugChanged = slug.trim() !== (user?.channel?.slug ?? user?.username);

  useEffect(() => {
    if (!slugChanged || slug.trim().length < 3) {
      setSlugStatus(
        slug.trim().length > 0 && slug.trim().length < 3 ? 'invalid' : 'idle',
      );
      return;
    }
    setSlugStatus('checking');
    let cancelled = false;
    const t = setTimeout(() => {
      void checkSlugAvailable(slug.trim()).then((r) => {
        if (!cancelled) {
          setSlugStatus(r.available ? 'available' : 'taken');
        }
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [slug, slugChanged]);

  const finish = async (skip: boolean) => {
    if (!user) {
      return;
    }
    if (skip) {
      markOnboardingSeen(user.id);
      void navigate({ to: '/' });
      return;
    }
    setSaving(true);
    try {
      if (!user.channel) {
        const provisioned = await provisionChannel();
        if (!provisioned.ok) {
          toast.error(provisioned.error);
          setSaving(false);
          return;
        }
      }
      if (slugChanged && slugStatus === 'available') {
        const renamed = await updateChannelSlug(slug.trim());
        if (!renamed.ok) {
          toast.error(renamed.error);
        }
      }
      const profileResult = await patchMeProfile({
        displayName: displayName.trim() || undefined,
        pronouns: pronouns.trim() || null,
        bio: bio.trim() || undefined,
        artistKind,
        countryCode: countryCode || null,
        defaultLocation: defaultLocation.trim() || null,
        showFollowers,
        showFollowing,
      });
      if (!profileResult.ok) {
        toast.error(profileResult.error);
      }
      const discoveryResult = await patchDiscoveryPrefs({
        genreTags: formatGenreTags(genres),
        showFavorites,
        announceReleases,
      });
      if (!discoveryResult.ok) {
        toast.error(discoveryResult.error);
      }
      await refresh();
      markOnboardingSeen(user.id);
      toast.success('Profile set up.');
      void navigate({ to: '/studio' });
    } finally {
      setSaving(false);
    }
  };

  const emailPreview = useMemo(() => {
    const s = slug.trim() || user?.username || 'you';
    return `${s}@tahti.live`;
  }, [slug, user?.username]);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-1 py-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Welcome to Tahti
        </h1>
        <p className="text-foreground-secondary mt-1 text-sm">
          A few quick things to set up your profile — you can change any of this
          later in Settings.
        </p>
      </header>

      {loading ? (
        <p className="text-foreground-secondary text-sm">Loading…</p>
      ) : (
        <>
          <Tabs
            listClassName="flex-wrap border-border border-b pb-3"
            panelClassName="pt-4"
            items={[
              {
                id: 'profile',
                label: 'Profile',
                content: (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-4">
                      <Input
                        label="Display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                      <Input
                        label="Pronouns"
                        value={pronouns}
                        onChange={(e) => setPronouns(e.target.value)}
                        description="Optional"
                      />
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="text-foreground-secondary text-xs uppercase">
                          I am a…
                        </span>
                        <div className="flex gap-2">
                          {(
                            [
                              ['SINGLE', 'Solo artist'],
                              ['COLLECTIVE', 'Band / collective'],
                            ] as const
                          ).map(([kind, label]) => (
                            <button
                              key={kind}
                              type="button"
                              aria-pressed={artistKind === kind}
                              onClick={() => setArtistKind(kind)}
                              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                artistKind === kind
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border text-foreground-secondary hover:text-foreground'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </label>
                      {artistKind === 'COLLECTIVE' && (
                        <p className="text-foreground-secondary text-xs">
                          You can invite full band members later from Studio →
                          Artist → Members.
                        </p>
                      )}
                    </div>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="text-foreground-secondary text-xs uppercase">
                        Bio
                      </span>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={9}
                        placeholder="Tell listeners what you do…"
                        className="border-border bg-background focus:border-primary rounded-md border px-3 py-2 text-sm outline-none"
                      />
                    </label>
                  </div>
                ),
              },
              {
                id: 'location',
                label: 'Location & domain',
                content: (
                  <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="text-foreground-secondary text-xs uppercase">
                        Country
                      </span>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="border-border bg-background rounded-md border px-3 py-2 text-sm"
                      >
                        <option value="">Prefer not to say</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input
                      label="City / location"
                      value={defaultLocation}
                      onChange={(e) => setDefaultLocation(e.target.value)}
                      description="Optional — shown on your public profile"
                    />
                    <div className="flex flex-col gap-1.5">
                      <Input
                        label="Your Tahti domain"
                        value={slug}
                        onChange={(e) =>
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ''),
                          )
                        }
                        description="lowercase letters, numbers, and -"
                      />
                      {slugChanged && (
                        <p
                          className={`text-xs ${
                            slugStatus === 'available'
                              ? 'text-accent-green'
                              : slugStatus === 'taken' ||
                                  slugStatus === 'invalid'
                                ? 'text-accent-red'
                                : 'text-foreground-secondary'
                          }`}
                        >
                          {slugStatus === 'checking' && 'Checking…'}
                          {slugStatus === 'available' && 'Available'}
                          {slugStatus === 'taken' && 'Already taken'}
                          {slugStatus === 'invalid' && 'At least 3 characters'}
                        </p>
                      )}
                      <div className="border-border bg-background-secondary/40 mt-1 flex flex-col gap-1 rounded-lg border p-3 text-xs">
                        <span>
                          Your channel:{' '}
                          <span className="font-mono">
                            {slug.trim() || user.username}.tahti.live
                          </span>
                        </span>
                        <span>
                          Your email will be:{' '}
                          <span className="font-mono">{emailPreview}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: 'genres',
                label: 'Genres',
                content: (
                  <div className="flex flex-col gap-2">
                    <p className="text-foreground-secondary text-sm">
                      Pick up to {MAX_GENRES} genres you make or play — helps
                      listeners find you.
                    </p>
                    <GenrePicker value={genres} onChange={setGenres} />
                  </div>
                ),
              },
              {
                id: 'defaults',
                label: 'Defaults',
                content: (
                  <div className="flex flex-col gap-4">
                    {(
                      [
                        [
                          'Show followers',
                          'Follower count is visible on your public profile.',
                          showFollowers,
                          setShowFollowers,
                        ],
                        [
                          'Show following',
                          'Who you follow is visible on your public profile.',
                          showFollowing,
                          setShowFollowing,
                        ],
                        [
                          'Show favourites',
                          'Your favourited tracks and channels are visible on your public profile.',
                          showFavorites,
                          setShowFavorites,
                        ],
                        [
                          'Announce releases',
                          'Followers get a notification (and optional email) when you publish a release.',
                          announceReleases,
                          setAnnounceReleases,
                        ],
                      ] as const
                    ).map(([label, hint, checked, setter]) => (
                      <div key={label} className="flex items-start gap-3">
                        <Toggle
                          checked={checked}
                          onChange={setter}
                          aria-label={label}
                        />
                        <div>
                          <div className="text-sm font-medium">{label}</div>
                          <div className="text-foreground-secondary text-xs">
                            {hint}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
          />

          <div className="border-border flex items-center justify-between border-t pt-4">
            <Button
              variant="text"
              size="sm"
              disabled={saving}
              onClick={() => void finish(true)}
            >
              Skip for now
            </Button>
            <Button
              disabled={saving || (slugChanged && slugStatus === 'taken')}
              onClick={() => void finish(false)}
            >
              {saving ? 'Saving…' : 'Finish setup'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
