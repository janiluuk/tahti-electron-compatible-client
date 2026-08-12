import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input, SectionShell } from '@nuclearplayer/ui';

import {
  fetchChannelMembers,
  fetchDiscoveryPrefs,
  fetchGreenRoomPrefs,
  fetchModerators,
  fetchNotificationPrefs,
  fetchPressKitMeta,
  fetchSocialConnections,
  patchDiscoveryPrefs,
  patchGreenRoomPrefs,
  patchNotificationPrefs,
  patchPressKitBio,
  patchSocialConnections,
  type ChannelMember,
  type DiscoveryPrefs,
  type GreenRoomPrefs,
  type ModeratorRow,
  type NotificationPrefs,
  type PressKitMeta,
  type SocialConnections,
} from '../../api/artist-settings';
import {
  createRtmpTarget,
  deleteRtmpTarget,
  fetchRtmpTargets,
  patchRtmpTarget,
  type RtmpTarget,
} from '../../api/broadcast';
import {
  checkSlugAvailable,
  setCustomDomain,
  updateChannelSlug,
  verifyCustomDomain,
} from '../../api/channel-design';
import { fetchMembership, fetchMySubscriptions } from '../../api/client';
import {
  fetchFanConnectPortal,
  fetchFanConnectStatus,
  fetchGrantEstimate,
  fetchMyGrants,
  startFanConnectOnboard,
  type FanConnectStatus,
  type GrantEstimate,
  type GrantRow,
} from '../../api/revenue';
import {
  fetchMeProfile,
  fetchProgramme,
  patchMeProfile,
  patchProgramme,
  type ProfileFields,
  type ProgrammeView,
} from '../../api/studio-extras';
import type { FanSubscriptionRow, MembershipStatus } from '../../api/types';
import { ChannelDesigner } from '../../components/ChannelDesigner';
import { FanTiersEditor } from '../../components/FanTiersEditor';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { SettingsHint, SettingsInfo, SettingsToggle } from './SettingsFields';
import type { SettingsSectionId } from './settingsNav';

function euros(cents: number | string): string {
  const n = typeof cents === 'string' ? Number(cents) : cents;
  if (!Number.isFinite(n)) {
    return '—';
  }
  return `€${(n / 100).toFixed(n % 100 === 0 ? 0 : 2)}`;
}

export function SettingsSectionBody({
  section,
}: {
  section: SettingsSectionId;
}) {
  switch (section) {
    case 'account':
      return <AccountPanel />;
    case 'artist':
      return <ArtistPanel />;
    case 'channel':
      return <ChannelPanel />;
    case 'broadcast':
      return <BroadcastPanel />;
    case 'money':
      return <MoneyPanel />;
    case 'notifications':
      return <NotificationsPanel />;
    case 'themes':
      return <ThemesPanel />;
    case 'connections':
      return <ConnectionsPanel />;
    default:
      return null;
  }
}

function AccountPanel() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [source, setSource] = useState('…');

  useEffect(() => {
    if (!user) {
      return;
    }
    void fetchMembership().then((r) => {
      setMembership(r.data);
      setSource(r.meta.source);
    });
  }, [user]);

  if (!user) {
    return (
      <SectionShell title="Account">
        <div className="flex flex-col gap-4">
          <SettingsHint>
            Sign in to manage membership and security.
          </SettingsHint>
          <Link to="/login">
            <Button size="sm">Login</Button>
          </Link>
        </div>
      </SectionShell>
    );
  }

  return (
    <>
      <SectionShell title="Session">
        <div className="flex flex-col gap-6">
          <SettingsInfo label="Signed in as" value={`@${user.username}`} />
          <SettingsInfo label="Display name" value={user.displayName} />
          {user.email && <SettingsInfo label="Email" value={user.email} />}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="text" onClick={() => void logout()}>
              Log out
            </Button>
            <a
              href="https://tahti.live/dashboard/settings/account"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" variant="secondary">
                Security on production
              </Button>
            </a>
          </div>
        </div>
      </SectionShell>

      <SectionShell title="Membership">
        <div className="flex flex-col gap-4">
          <SettingsHint>Source: {source}</SettingsHint>
          {!membership ? (
            <SettingsHint>Could not load membership.</SettingsHint>
          ) : (
            <div className="flex flex-col gap-4">
              <SettingsInfo label="Status" value={membership.status} />
              <SettingsInfo
                label="Member"
                value={membership.isMember ? 'Yes' : 'No'}
              />
              {membership.memberNumber != null && (
                <SettingsInfo
                  label="Member #"
                  value={String(membership.memberNumber)}
                />
              )}
              {membership.tier && (
                <SettingsInfo label="Tier" value={membership.tier} />
              )}
              {typeof membership.priceCents === 'number' && (
                <SettingsInfo
                  label="Dues"
                  value={`${euros(membership.priceCents)} / year`}
                />
              )}
              {membership.renewalDueAt && (
                <SettingsInfo
                  label="Renewal"
                  value={new Date(membership.renewalDueAt).toLocaleDateString()}
                />
              )}
            </div>
          )}
          <Link to="/governance">
            <Button size="sm" variant="secondary">
              Governance
            </Button>
          </Link>
        </div>
      </SectionShell>
    </>
  );
}

function ArtistPanel() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<ProfileFields | null>(null);
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [press, setPress] = useState<PressKitMeta | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetchMeProfile(),
      fetchChannelMembers(),
      fetchPressKitMeta(),
    ]).then(([p, m, k]) => {
      setProfile(p.data);
      setMembers(m.data);
      setPress(k.data);
    });
  }, []);

  if (!user) {
    return (
      <SectionShell title="Artist">
        <SettingsHint>
          <Link to="/login" className="underline-offset-2 hover:underline">
            Sign in
          </Link>{' '}
          to edit artist profile.
        </SettingsHint>
      </SectionShell>
    );
  }

  return (
    <>
      <SectionShell title="Artist info">
        {!profile ? (
          <SettingsHint>Loading…</SettingsHint>
        ) : (
          <div className="flex flex-col gap-6">
            <Input
              label="Display name"
              value={profile.displayName}
              onChange={(e) =>
                setProfile({ ...profile, displayName: e.target.value })
              }
            />
            <label className="flex flex-col gap-1">
              <span className="text-foreground text-sm font-semibold">Bio</span>
              <textarea
                className="border-border bg-background rounded-md border px-3 py-2 text-sm"
                rows={4}
                value={profile.bio ?? ''}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
            </label>
            <Input
              label="Pronouns"
              value={profile.pronouns ?? ''}
              onChange={(e) =>
                setProfile({ ...profile, pronouns: e.target.value })
              }
            />
            <Input
              label="Tip jar URL"
              value={profile.tipJarUrl ?? ''}
              onChange={(e) =>
                setProfile({ ...profile, tipJarUrl: e.target.value })
              }
            />
            <SettingsToggle
              label="Public channel chat"
              description="Allow listeners to chat on your live channel."
              value={profile.chatEnabled}
              onChange={(v) => setProfile({ ...profile, chatEnabled: v })}
            />
            <Button
              size="sm"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void patchMeProfile({
                  displayName: profile.displayName.trim(),
                  bio: profile.bio?.trim() || null,
                  tipJarUrl: profile.tipJarUrl?.trim() || null,
                  pronouns: profile.pronouns?.trim() || null,
                  chatEnabled: profile.chatEnabled,
                }).then((r) => {
                  setBusy(false);
                  setMsg(r.ok ? 'Artist info saved.' : r.error);
                  if (r.ok) {
                    setProfile(r.data);
                  }
                });
              }}
            >
              Save artist info
            </Button>
            {msg && <SettingsHint>{msg}</SettingsHint>}
          </div>
        )}
      </SectionShell>

      <SectionShell title="Members">
        <div className="flex flex-col gap-4">
          <SettingsHint>
            Collective / band members who share this channel. Invite flows stay
            on production for now.
          </SettingsHint>
          {members.length === 0 ? (
            <SettingsHint>No members listed.</SettingsHint>
          ) : (
            <ul className="flex flex-col gap-2">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="border-border flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>
                    {m.displayName} (@{m.username})
                  </span>
                  <span className="text-foreground-secondary text-xs uppercase">
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionShell>

      <SectionShell title="Media & press kit">
        {!press ? (
          <SettingsHint>Loading…</SettingsHint>
        ) : (
          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-1">
              <span className="text-foreground text-sm font-semibold">
                Short bio
              </span>
              <textarea
                className="border-border bg-background rounded-md border px-3 py-2 text-sm"
                rows={3}
                value={press.bioShort}
                onChange={(e) =>
                  setPress({ ...press, bioShort: e.target.value })
                }
              />
            </label>
            <SettingsInfo
              label="Press assets"
              value={`${press.photoCount} photos${press.hasZip ? ', ZIP ready' : ''}`}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  void patchPressKitBio(press.bioShort).then((r) => {
                    setMsg(r.ok ? 'Press kit bio saved.' : r.error);
                    if (r.ok) {
                      setPress(r.data);
                    }
                  });
                }}
              >
                Save press bio
              </Button>
              {press.downloadPath && (
                <a
                  href={`https://tahti.live${press.downloadPath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="secondary">
                    Download ZIP
                  </Button>
                </a>
              )}
              <a
                href="https://tahti.live/dashboard/settings/media"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" variant="text">
                  Full media builder
                </Button>
              </a>
            </div>
          </div>
        )}
      </SectionShell>
    </>
  );
}

function ChannelPanel() {
  const user = useAuthStore((s) => s.user);
  const channel = user?.channel;
  const [discovery, setDiscovery] = useState<DiscoveryPrefs | null>(null);
  const [slug, setSlug] = useState(channel?.slug ?? '');
  const [domain, setDomain] = useState('');
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void fetchDiscoveryPrefs().then((r) => setDiscovery(r.data));
    setSlug(channel?.slug ?? user?.username ?? '');
  }, [channel?.slug, user?.username]);

  if (!user) {
    return (
      <SectionShell title="Channel & design">
        <SettingsHint>
          Sign in with a channel to edit design and discovery.
        </SettingsHint>
      </SectionShell>
    );
  }

  return (
    <>
      <SectionShell title="Channel appearance">
        <div className="flex flex-col gap-4">
          <SettingsHint>
            Live preview of presets and accents. Owners can also open Design on{' '}
            <Link
              to="/u/$username"
              params={{ username: user.username }}
              className="underline-offset-2 hover:underline"
            >
              their public profile
            </Link>
            .
          </SettingsHint>
          <ChannelDesigner
            displayName={user.displayName}
            username={user.username}
            channelSlug={channel?.slug}
            avatarUrl={user.avatarUrl}
            compact
          />
        </div>
      </SectionShell>

      <SectionShell title="Discovery">
        {!discovery ? (
          <SettingsHint>Loading…</SettingsHint>
        ) : (
          <div className="flex flex-col gap-6">
            <SettingsToggle
              label="List in Listen directory"
              value={discovery.listedInDirectory}
              onChange={(v) => {
                const next = { ...discovery, listedInDirectory: v };
                setDiscovery(next);
                void patchDiscoveryPrefs({ listedInDirectory: v });
              }}
            />
            <SettingsToggle
              label="Allow Tahti Radio pickup"
              value={discovery.allowRadioPickup}
              onChange={(v) => {
                const next = { ...discovery, allowRadioPickup: v };
                setDiscovery(next);
                void patchDiscoveryPrefs({ allowRadioPickup: v });
              }}
            />
            <SettingsToggle
              label="Featured on Listen home"
              description="Subject to editorial / algorithmic placement."
              value={discovery.showOnListenHome}
              onChange={(v) => {
                const next = { ...discovery, showOnListenHome: v };
                setDiscovery(next);
                void patchDiscoveryPrefs({ showOnListenHome: v });
              }}
            />
            <Input
              label="Genre tags"
              description="Comma-separated labels for discovery."
              value={discovery.genreTags}
              onChange={(e) =>
                setDiscovery({ ...discovery, genreTags: e.target.value })
              }
              onBlur={() => {
                void patchDiscoveryPrefs({ genreTags: discovery.genreTags });
              }}
            />
          </div>
        )}
      </SectionShell>

      <SectionShell title="Username & domain">
        <div className="flex flex-col gap-6">
          <Input
            label="Channel slug / username"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void checkSlugAvailable(slug.trim()).then((r) => {
                  setNote(
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
                  setNote(r.ok ? `Renamed to ${r.slug}` : r.error);
                });
              }}
            >
              Rename
            </Button>
          </div>
          <Input
            label="Custom domain"
            description={
              channel?.customDomain
                ? `Current: ${channel.customDomain}${channel.customDomainVerified ? ' (verified)' : ' (pending)'}`
                : 'Requires membership. Add DNS TXT then verify.'
            }
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
                    setNote(r.error);
                  } else {
                    setNote(
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
                  setNote(
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
          {note && <SettingsHint>{note}</SettingsHint>}
        </div>
      </SectionShell>
    </>
  );
}

function BroadcastPanel() {
  const [programme, setProgramme] = useState<ProgrammeView | null>(null);
  const [green, setGreen] = useState<GreenRoomPrefs | null>(null);
  const [mods, setMods] = useState<ModeratorRow[]>([]);
  const [targets, setTargets] = useState<RtmpTarget[]>([]);
  const [newProvider, setNewProvider] = useState('TWITCH');
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const reloadTargets = () => {
    void fetchRtmpTargets().then((r) => setTargets(r.data));
  };

  useEffect(() => {
    void Promise.all([
      fetchProgramme(),
      fetchGreenRoomPrefs(),
      fetchModerators(),
    ]).then(([p, g, m]) => {
      setProgramme(p.data);
      setGreen(g.data);
      setMods(m.data);
    });
    reloadTargets();
  }, []);

  return (
    <>
      <SectionShell title="Radio & announcements">
        {!programme ? (
          <SettingsHint>Loading…</SettingsHint>
        ) : (
          <div className="flex flex-col gap-6">
            <SettingsToggle
              label="Announcements enabled"
              description="Allow platform/radio announcements on your channel programme."
              value={programme.announcementsEnabled}
              onChange={(v) => {
                const next = { ...programme, announcementsEnabled: v };
                setProgramme(next);
                void patchProgramme({ announcementsEnabled: v });
              }}
            />
            <SettingsToggle
              label="Fallback / autoplay when offline"
              value={programme.fallbackEnabled}
              onChange={(v) => {
                const next = { ...programme, fallbackEnabled: v };
                setProgramme(next);
                void patchProgramme({ fallbackEnabled: v });
              }}
            />
            <SettingsToggle
              label="Auto-enroll new archive into fallback"
              value={programme.fallbackAutoEnroll}
              onChange={(v) => {
                const next = { ...programme, fallbackAutoEnroll: v };
                setProgramme(next);
                void patchProgramme({ fallbackAutoEnroll: v });
              }}
            />
            <Link to="/studio/schedule">
              <Button size="sm" variant="secondary">
                Open schedule / programme
              </Button>
            </Link>
          </div>
        )}
      </SectionShell>

      <SectionShell title="Green room">
        {!green ? (
          <SettingsHint>Loading…</SettingsHint>
        ) : (
          <div className="flex flex-col gap-6">
            <Input
              label="Default show title"
              value={green.defaultTitle}
              onChange={(e) =>
                setGreen({ ...green, defaultTitle: e.target.value })
              }
              onBlur={() =>
                void patchGreenRoomPrefs({ defaultTitle: green.defaultTitle })
              }
            />
            <Input
              label="Default note"
              value={green.defaultNote}
              onChange={(e) =>
                setGreen({ ...green, defaultNote: e.target.value })
              }
              onBlur={() =>
                void patchGreenRoomPrefs({ defaultNote: green.defaultNote })
              }
            />
            <SettingsToggle
              label="Auto-announce when going live"
              value={green.autoAnnounce}
              onChange={(v) => {
                setGreen({ ...green, autoAnnounce: v });
                void patchGreenRoomPrefs({ autoAnnounce: v });
              }}
            />
            <SettingsToggle
              label="Hold music while waiting for signal"
              value={green.holdMusicEnabled}
              onChange={(v) => {
                setGreen({ ...green, holdMusicEnabled: v });
                void patchGreenRoomPrefs({ holdMusicEnabled: v });
              }}
            />
            <Link to="/studio/go-live">
              <Button size="sm" variant="secondary">
                Go Live
              </Button>
            </Link>
          </div>
        )}
      </SectionShell>

      <SectionShell title="Moderators">
        <div className="flex flex-col gap-4">
          <SettingsHint>Chat moderators for your live channel.</SettingsHint>
          {mods.length === 0 ? (
            <SettingsHint>No moderators yet.</SettingsHint>
          ) : (
            <ul className="flex flex-col gap-2">
              {mods.map((m) => (
                <li
                  key={m.id}
                  className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <span>
                    {m.displayName} (@{m.username})
                  </span>
                  <span className="text-foreground-secondary text-xs">
                    {m.canTimeout ? 'timeout' : ''}
                    {m.canTimeout && m.canDelete ? ', ' : ''}
                    {m.canDelete ? 'delete' : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <a
            href="https://tahti.live/dashboard/settings/moderators"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" variant="text">
              Manage on production
            </Button>
          </a>
        </div>
      </SectionShell>

      <SectionShell title="Multistream">
        <div className="flex flex-col gap-4">
          <SettingsHint>
            Mirror shows to Twitch, YouTube, etc. Paste each platform’s stream
            key.
          </SettingsHint>
          {targets.length === 0 ? (
            <SettingsHint>No destinations yet.</SettingsHint>
          ) : (
            <ul className="flex flex-col gap-2">
              {targets.map((t) => (
                <li
                  key={t.id}
                  className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {t.label || t.provider} {t.enabled ? '' : '(off)'}
                    </div>
                    <div className="text-foreground-secondary text-xs">
                      {t.provider}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        void patchRtmpTarget(t.id, {
                          enabled: !t.enabled,
                        }).then(reloadTargets);
                      }}
                    >
                      {t.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="text"
                      onClick={() => {
                        void deleteRtmpTarget(t.id).then(reloadTargets);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Input
              label="Provider"
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
            />
            <Input
              label="Label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <Input
              label="Stream key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <Button
              size="sm"
              disabled={!newKey.trim()}
              onClick={() => {
                void createRtmpTarget({
                  provider: newProvider.trim(),
                  streamKey: newKey.trim(),
                  label: newLabel.trim() || undefined,
                }).then((r) => {
                  if (!r.ok) {
                    setMsg(r.error);
                  } else {
                    setNewKey('');
                    setNewLabel('');
                    reloadTargets();
                  }
                });
              }}
            >
              Add
            </Button>
          </div>
          {msg && <SettingsHint>{msg}</SettingsHint>}
        </div>
      </SectionShell>
    </>
  );
}

function MoneyPanel() {
  const user = useAuthStore((s) => s.user);
  const [connect, setConnect] = useState<FanConnectStatus | null>(null);
  const [grants, setGrants] = useState<GrantRow[]>([]);
  const [estimate, setEstimate] = useState<GrantEstimate | null>(null);
  const [subs, setSubs] = useState<FanSubscriptionRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetchFanConnectStatus(),
      fetchMyGrants(),
      fetchGrantEstimate(),
      user
        ? fetchMySubscriptions()
        : Promise.resolve({ data: [] as FanSubscriptionRow[] }),
    ]).then(([c, g, e, s]) => {
      setConnect(c.data);
      setGrants(g.data);
      setEstimate(e.data);
      setSubs(s.data);
    });
  }, [user]);

  return (
    <>
      <SectionShell title="Fan tiers (artist)">
        <FanTiersEditor />
      </SectionShell>

      <SectionShell title="Fan subs (artist)">
        {!connect ? (
          <SettingsHint>Loading…</SettingsHint>
        ) : (
          <div className="flex flex-col gap-4">
            <SettingsInfo
              label="Payments ready"
              value={connect.paymentsReady ? 'Yes' : 'Not yet'}
            />
            <SettingsInfo
              label="Charges enabled"
              value={connect.chargesEnabled ? 'Yes' : 'No'}
            />
            {connect.accountId && (
              <SettingsInfo label="Connect account" value={connect.accountId} />
            )}
            <div className="flex flex-wrap gap-2">
              {!connect.paymentsReady && (
                <Button
                  size="sm"
                  onClick={() => {
                    void startFanConnectOnboard().then((r) => {
                      if (!r.ok) {
                        setMsg(r.error);
                        return;
                      }
                      if ('mockActivated' in r) {
                        setMsg(r.message);
                        void fetchFanConnectStatus().then((x) =>
                          setConnect(x.data),
                        );
                        return;
                      }
                      window.open(r.url, '_blank', 'noopener,noreferrer');
                    });
                  }}
                >
                  Start / resume onboarding
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void fetchFanConnectPortal().then((r) => {
                    if (!r.ok) {
                      setMsg(r.error);
                      return;
                    }
                    if ('mockActivated' in r) {
                      setMsg(r.message);
                      return;
                    }
                    window.open(r.url, '_blank', 'noopener,noreferrer');
                  });
                }}
              >
                Stripe portal
              </Button>
              <Link to="/studio/revenue">
                <Button size="sm" variant="text">
                  Studio revenue
                </Button>
              </Link>
            </div>
            {msg && <SettingsHint>{msg}</SettingsHint>}
          </div>
        )}
      </SectionShell>

      <SectionShell title="Grants">
        <div className="flex flex-col gap-4">
          {estimate && (
            <SettingsInfo
              label={`Estimate ${estimate.year}`}
              value={`${euros(estimate.estimateCents)} (${estimate.units} units)`}
              description={
                estimate.eligible ? 'Eligible' : 'Not currently eligible'
              }
            />
          )}
          {grants.length === 0 ? (
            <SettingsHint>No grant rows yet.</SettingsHint>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {grants.map((g) => (
                <li
                  key={`${g.forYear}-${g.state}`}
                  className="border-border rounded-md border px-3 py-2"
                >
                  {g.forYear}: {euros(g.amountCents)} — {g.state}
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionShell>

      <SectionShell title="Your fan subscriptions">
        <div className="flex flex-col gap-4">
          {!user ? (
            <SettingsHint>
              Sign in to see subscriptions you pay for.
            </SettingsHint>
          ) : subs.length === 0 ? (
            <SettingsHint>No fan subscriptions on this account.</SettingsHint>
          ) : (
            <ul className="flex flex-col gap-2">
              {subs.map((s) => (
                <li
                  key={s.id}
                  className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <Link
                      to="/u/$username"
                      params={{ username: s.artist.username }}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {s.artist.displayName}
                    </Link>
                    <p className="text-foreground-secondary text-xs">
                      {s.tierName}, {euros(s.amountCents)}/mo, {s.state}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionShell>
    </>
  );
}

function NotificationsPanel() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

  useEffect(() => {
    void fetchNotificationPrefs().then((r) => setPrefs(r.data));
  }, []);

  const set = (key: keyof NotificationPrefs, value: boolean) => {
    if (!prefs) {
      return;
    }
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    void patchNotificationPrefs({ [key]: value });
  };

  return (
    <SectionShell title="Notifications">
      {!prefs ? (
        <SettingsHint>Loading…</SettingsHint>
      ) : (
        <div className="flex flex-col gap-6">
          <SettingsToggle
            label="Email: new fan subscriber"
            value={prefs.emailFanSub}
            onChange={(v) => set('emailFanSub', v)}
          />
          <SettingsToggle
            label="Email: comments"
            value={prefs.emailComment}
            onChange={(v) => set('emailComment', v)}
          />
          <SettingsToggle
            label="Email: mentions"
            value={prefs.emailMention}
            onChange={(v) => set('emailMention', v)}
          />
          <SettingsToggle
            label="Email: broadcast reminders"
            value={prefs.emailBroadcastReminder}
            onChange={(v) => set('emailBroadcastReminder', v)}
          />
          <SettingsToggle
            label="Push: when you go live (followers)"
            value={prefs.pushLiveStart}
            onChange={(v) => set('pushLiveStart', v)}
          />
          <SettingsToggle
            label="Weekly digest"
            value={prefs.digestWeekly}
            onChange={(v) => set('digestWeekly', v)}
          />
        </div>
      )}
    </SectionShell>
  );
}

function ThemesPanel() {
  const { themes, themeId, dark, setTheme, setDark } = useThemeStore();

  return (
    <>
      <SectionShell title="Mode">
        <div className="flex flex-col gap-4">
          <SettingsHint>
            Dark / light for the Nuclear chrome (this app).
          </SettingsHint>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant={dark ? undefined : 'text'}
              onClick={() => setDark(true)}
            >
              Dark
            </Button>
            <Button
              size="sm"
              variant={!dark ? undefined : 'text'}
              onClick={() => setDark(false)}
            >
              Light
            </Button>
          </div>
        </div>
      </SectionShell>
      <SectionShell title="Basic themes">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {themes.map((theme) => {
            const active = theme.id === themeId;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setTheme(theme.id)}
                className={
                  active
                    ? 'border-border bg-primary rounded-lg border p-4 text-left'
                    : 'border-border bg-background hover:bg-background-secondary rounded-lg border p-4 text-left'
                }
              >
                <div className="mb-3 flex gap-2">
                  {theme.palette.map((color) => (
                    <span
                      key={color}
                      className="border-border size-8 rounded-md border"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <div className="font-bold">{theme.name}</div>
                <div className="text-foreground-secondary text-xs">
                  {theme.id}
                </div>
              </button>
            );
          })}
        </div>
      </SectionShell>
    </>
  );
}

function ConnectionsPanel() {
  const [social, setSocial] = useState<SocialConnections | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetchSocialConnections().then((r) => setSocial(r.data));
  }, []);

  return (
    <>
      <SectionShell title="Social links">
        {!social ? (
          <SettingsHint>Loading…</SettingsHint>
        ) : (
          <div className="flex flex-col gap-6">
            {(
              [
                ['website', 'Website'],
                ['instagram', 'Instagram'],
                ['bandcamp', 'Bandcamp'],
                ['soundcloud', 'SoundCloud'],
                ['youtube', 'YouTube'],
                ['discord', 'Discord'],
              ] as const
            ).map(([key, label]) => (
              <Input
                key={key}
                label={label}
                value={social[key]}
                onChange={(e) =>
                  setSocial({ ...social, [key]: e.target.value })
                }
              />
            ))}
            <Button
              size="sm"
              onClick={() => {
                if (!social) {
                  return;
                }
                void patchSocialConnections(social).then((r) => {
                  setMsg(r.ok ? 'Connections saved.' : r.error);
                  if (r.ok) {
                    setSocial(r.data);
                  }
                });
              }}
            >
              Save connections
            </Button>
            {msg && <SettingsHint>{msg}</SettingsHint>}
          </div>
        )}
      </SectionShell>

      <SectionShell title="Import sources">
        <div className="flex flex-col gap-4">
          <SettingsHint>
            OAuth and cloud import live under Sources (Bandcamp, SoundCloud,
            Drive, Mixcloud, …).
          </SettingsHint>
          <Link to="/sources">
            <Button size="sm">Open Sources</Button>
          </Link>
        </div>
      </SectionShell>
    </>
  );
}
