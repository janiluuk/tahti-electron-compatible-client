import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

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
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { useAuthStore } from '../../stores/authStore';

type Tab = 'design' | 'profile' | 'domain';

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
  const [msg, setMsg] = useState<string | null>(null);
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
    setMsg(null);
    const result = await patchMeProfile({
      displayName: displayName.trim(),
      bio: bio.trim() || null,
      tipJarUrl: tipJarUrl.trim() || null,
      pronouns: pronouns.trim() || null,
      chatEnabled,
    });
    setBusy(false);
    if (!result.ok) {
      setMsg(result.error);
      return;
    }
    setProfile(result.data);
    setMsg('Profile saved.');
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/channel" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Channel
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Design, profile, and domain shortcut. Full prefs (themes,
            notifications, broadcast, money, connections) live under{' '}
            <Link to="/settings" className="underline-offset-2 hover:underline">
              Settings
            </Link>
            .
          </p>
          {user && (
            <Link
              to="/u/$username"
              params={{ username: user.username }}
              className="text-foreground-secondary mt-1 inline-block text-xs underline-offset-2 hover:underline"
            >
              Open public profile →
            </Link>
          )}
        </div>

        <nav className="flex flex-wrap gap-2">
          {(
            [
              { id: 'design' as const, label: 'Design' },
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
                  ? 'bg-primary text-foreground'
                  : 'border-border text-foreground-secondary hover:text-foreground border'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'design' && user && (
          <ChannelDesigner
            displayName={displayName || user.displayName}
            username={user.username}
            channelSlug={channel?.slug}
            avatarUrl={user.avatarUrl}
            bio={bio || profile?.bio}
          />
        )}

        {tab === 'profile' && (
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
                  <input
                    type="checkbox"
                    checked={chatEnabled}
                    onChange={(e) => setChatEnabled(e.target.checked)}
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
        )}

        {tab === 'domain' && (
          <div className="flex flex-col gap-4">
            <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
              <h2 className="font-display text-lg font-bold">
                Username / channel slug
              </h2>
              <Input
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
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
                      setSlugNote(r.ok ? `Renamed to ${r.slug}` : r.error);
                    });
                  }}
                >
                  Rename
                </Button>
              </div>
              {slugNote && (
                <p className="text-foreground-secondary text-xs">{slugNote}</p>
              )}
            </section>

            <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
              <h2 className="font-display text-lg font-bold">Custom domain</h2>
              <p className="text-foreground-secondary text-xs">
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
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    void setCustomDomain(domain.trim()).then((r) => {
                      if (!r.ok) {
                        setDomainInfo(r.error);
                      } else {
                        setDomainInfo(
                          `Add TXT ${r.txtHost} = ${r.txtRecord}, then Verify.`,
                        );
                      }
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
                      setDomainInfo(
                        r.ok
                          ? r.verified
                            ? 'Verified!'
                            : 'Not verified yet'
                          : r.error,
                      );
                    });
                  }}
                >
                  Verify DNS
                </Button>
              </div>
              {domainInfo && (
                <p className="text-foreground-secondary text-xs">
                  {domainInfo}
                </p>
              )}
            </section>
          </div>
        )}

        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </StudioGate>
  );
}
