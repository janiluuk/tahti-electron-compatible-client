import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button, Input, Toggle } from '@nuclearplayer/ui';

import {
  checkSlugAvailable,
  setCustomDomain,
  updateChannelSlug,
  verifyCustomDomain,
} from '../../api/channel-design';
import {
  fetchMeProfile,
  patchMeProfile,
  type ProfileFields,
} from '../../api/studio-extras';
import { ChannelDesigner } from '../../components/ChannelDesigner';
import { ChannelRadioPlaylistPanel } from '../../components/ChannelRadioPlaylistPanel';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { useAuthStore } from '../../stores/authStore';

type Tab = 'design' | 'radio' | 'profile' | 'domain';

export function StudioChannelView() {
  const user = useAuthStore((s) => s.user);
  const channel = user?.channel;
  const [tab, setTab] = useState<Tab>('design');
  const [profile, setProfile] = useState<ProfileFields | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [tipJarUrl, setTipJarUrl] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [slug, setSlug] = useState(channel?.slug ?? '');
  const [slugNote, setSlugNote] = useState<string | null>(null);
  const [domain, setDomain] = useState('');
  const [domainInfo, setDomainInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchMeProfile().then((r) => {
      setProfile(r.data);
      setDisplayName(r.data.displayName);
      setBio(r.data.bio ?? '');
      setTipJarUrl(r.data.tipJarUrl ?? '');
      setPronouns(r.data.pronouns ?? '');
      setChatEnabled(r.data.chatEnabled);
      setSlug(channel?.slug ?? r.data.username);
    });
  }, [channel?.slug]);

  const saveProfile = async () => {
    setBusy(true);
    const result = await patchMeProfile({
      displayName: displayName.trim(),
      bio: bio.trim() || null,
      tipJarUrl: tipJarUrl.trim() || null,
      pronouns: pronouns.trim() || null,
      chatEnabled,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setProfile(result.data);
    toast.success('Profile saved.');
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/channel" />
        <StudioPageHeader
          title="Channel designer"
          subtitle="Look, 24/7 radio playlist, profile, and domain. Full prefs live under Settings."
        />
        {user && (
          <Link
            to="/u/$username"
            params={{ username: user.username }}
            className="text-foreground-secondary -mt-2 text-xs underline-offset-2 hover:underline"
          >
            Open public profile →
          </Link>
        )}

        <nav className="flex flex-wrap gap-2">
          {(
            [
              { id: 'design' as const, label: 'Design' },
              { id: 'radio' as const, label: '24/7 radio' },
              { id: 'profile' as const, label: 'Profile' },
              { id: 'domain' as const, label: 'Username / domain' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
                tab === t.id
                  ? 'bg-primary text-foreground shadow-sm'
                  : 'border-border text-foreground-secondary hover:text-foreground border'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'design' && user && (
          <StudioPanel>
            {channel?.slug ? (
              <div className="border-border bg-background mb-4 flex flex-col gap-2 rounded-lg border px-4 py-3 shadow-sm">
                <p className="text-sm">
                  Prefer editing on the live page — drag layers and tune Look
                  there.
                </p>
                <Link
                  to="/channel/$slug"
                  params={{ slug: channel.slug }}
                  search={{ edit: '1' }}
                  className="text-sm font-medium underline-offset-2 hover:underline"
                >
                  Open channel design editor →
                </Link>
              </div>
            ) : null}
            <ChannelDesigner
              displayName={displayName || user.displayName}
              username={user.username}
              channelSlug={channel?.slug}
              avatarUrl={user.avatarUrl}
              bio={bio || profile?.bio}
            />
          </StudioPanel>
        )}

        {tab === 'radio' && <ChannelRadioPlaylistPanel />}

        {tab === 'profile' && (
          <StudioPanel title="Profile">
            <div className="flex flex-col gap-3">
              {!profile ? (
                <p className="text-foreground-secondary text-sm">Loading…</p>
              ) : (
                <>
                  <Input
                    label="Display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-foreground-secondary text-xs uppercase">
                      Bio
                    </span>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="border-border bg-background rounded-md border px-3 py-2"
                    />
                  </label>
                  <Input
                    label="Pronouns"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                  />
                  <Input
                    label="Tip jar URL"
                    value={tipJarUrl}
                    onChange={(e) => setTipJarUrl(e.target.value)}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <Toggle
                      checked={chatEnabled}
                      onChange={setChatEnabled}
                      aria-label="Public channel chat enabled"
                    />
                    Public channel chat enabled
                  </label>
                  <Button
                    size="sm"
                    disabled={busy || !displayName.trim()}
                    onClick={() => void saveProfile()}
                  >
                    {busy ? 'Saving…' : 'Save profile'}
                  </Button>
                </>
              )}
            </div>
          </StudioPanel>
        )}

        {tab === 'domain' && (
          <div className="flex flex-col gap-4">
            <StudioPanel title="Username / channel slug">
              <Input
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void checkSlugAvailable(slug.trim()).then((r) => {
                      setSlugNote(
                        r.available
                          ? 'Available'
                          : `Not available${r.reason ? ` (${r.reason})` : ''}`,
                      );
                    });
                  }}
                >
                  Check availability
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    void updateChannelSlug(slug.trim()).then((r) => {
                      if (r.ok) {
                        setSlugNote(null);
                        toast.success(`Renamed to ${r.slug}`);
                      } else {
                        toast.error(r.error);
                      }
                    });
                  }}
                >
                  Rename
                </Button>
              </div>
              {slugNote && (
                <p className="text-foreground-secondary mt-2 text-xs">
                  {slugNote}
                </p>
              )}
            </StudioPanel>

            <StudioPanel title="Custom domain">
              <p className="text-foreground-secondary mb-3 text-xs">
                Requires membership. Current:{' '}
                {channel?.customDomain
                  ? `${channel.customDomain}${channel.customDomainVerified ? ' (verified)' : ' (pending)'}`
                  : 'none'}
              </p>
              <Input
                label="Domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="music.example.com"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    void setCustomDomain(domain.trim()).then((r) => {
                      if (!r.ok) {
                        toast.error(r.error);
                        return;
                      }
                      // Stays inline, not a toast: these are DNS records the
                      // user has to read and copy into their registrar.
                      setDomainInfo(
                        `Add TXT ${r.txtHost} = ${r.txtRecord}, then Verify.`,
                      );
                    });
                  }}
                >
                  Set domain
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void verifyCustomDomain().then((r) => {
                      if (!r.ok) {
                        toast.error(r.error);
                      } else if (r.verified) {
                        toast.success('Domain verified.');
                      } else {
                        toast.warning(
                          'Not verified yet — DNS may still be propagating.',
                        );
                      }
                    });
                  }}
                >
                  Verify DNS
                </Button>
              </div>
              {domainInfo && (
                <p className="text-foreground-secondary mt-2 text-xs">
                  {domainInfo}
                </p>
              )}
            </StudioPanel>
          </div>
        )}
      </div>
    </StudioGate>
  );
}
