import { Link } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CheckIcon,
  CopyIcon,
  HeadphonesIcon,
  KeyRoundIcon,
  PlusIcon,
  RadioIcon,
  VideoIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  createRtmpTarget,
  deleteRtmpTarget,
  fetchBroadcastUsage,
  fetchRtmpTargets,
  fetchSignalStatus,
  fetchStreamSettings,
  formatUsageMinutes,
  getMockChannelState,
  liveChannelPlayable,
  mockSimulateSignal,
  patchRtmpTarget,
  postGoLive,
  type BroadcastUsage,
  type RtmpTarget,
  type SignalStatus,
  type StreamSettings,
} from '../../api/broadcast';
import { StreamManagerPanel } from '../../components/StreamManagerPanel';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { OnAirBadge } from '../../components/tahti/OnAirBadge';
import { useAuthStore } from '../../stores/authStore';
import { usePlayerStore } from '../../stores/playerStore';

type Ingest = 'obs' | 'icecast' | 'traktor';
type Panel = 'connect' | 'live' | 'multistream';

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="border-border bg-background-secondary flex flex-col gap-1 rounded-lg border p-3">
      <div className="text-foreground-secondary font-mono text-xs tracking-wide uppercase">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <code className="text-foreground flex-1 truncate font-mono text-sm">
          {value}
        </code>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            void copyText(value).then((copied) => {
              if (copied) {
                setOk(true);
                window.setTimeout(() => setOk(false), 1500);
              }
            });
          }}
        >
          {ok ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          {ok ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}

function statusTone(state: string): string {
  if (state === 'PREVIEW') {
    return 'border-border text-foreground border';
  }
  return 'bg-background-secondary text-foreground-secondary';
}

export function StudioGoLiveView() {
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refresh);
  const play = usePlayerStore((s) => s.play);

  const [settings, setSettings] = useState<StreamSettings | null>(null);
  const [signal, setSignal] = useState<SignalStatus | null>(null);
  const [usage, setUsage] = useState<BroadcastUsage | null>(null);
  const [targets, setTargets] = useState<RtmpTarget[]>([]);
  const [channelState, setChannelState] = useState(
    user?.channel?.state ?? 'OFFLINE',
  );
  const [ingest, setIngest] = useState<Ingest>('obs');
  const [panel, setPanel] = useState<Panel>('connect');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [newProvider, setNewProvider] = useState('TWITCH');
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [autoAdvanced, setAutoAdvanced] = useState(false);
  const [showAddDest, setShowAddDest] = useState(false);

  const slug = user?.channel?.slug ?? '';
  const isMock = import.meta.env.VITE_FORCE_MOCK === '1';

  const patchLocalChannel = useCallback((state: string) => {
    setChannelState(state);
    useAuthStore.setState((s) => {
      if (!s.user?.channel) {
        return s;
      }
      return {
        user: {
          ...s.user,
          channel: { ...s.user.channel, state },
        },
      };
    });
  }, []);

  const reload = useCallback(async () => {
    const [s, u, t] = await Promise.all([
      fetchStreamSettings(),
      fetchBroadcastUsage(),
      fetchRtmpTargets(),
    ]);
    setSettings(s.data);
    setUsage(u.data);
    setTargets(t.data);
    if (!s.data && s.meta.source === 'api' && s.meta.reason) {
      setMsg(
        `Stream settings: ${s.meta.reason} — log in as an artist with a channel.`,
      );
    } else if (s.data) {
      setMsg(null);
    }
    if (isMock) {
      setChannelState(getMockChannelState());
    }
  }, [isMock]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (user?.channel?.state && !isMock) {
      setChannelState(user.channel.state);
    }
  }, [user?.channel?.state, isMock]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const { data } = await fetchSignalStatus();
      if (!cancelled) {
        setSignal(data);
      }
      if (!isMock) {
        await refresh();
      } else {
        setChannelState(getMockChannelState());
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [refresh, isMock]);

  useEffect(() => {
    if (channelState === 'LIVE' || channelState === 'PREVIEW') {
      setPanel('live');
    }
  }, [channelState]);

  useEffect(() => {
    if (autoAdvanced || panel !== 'connect') {
      return;
    }
    if (signal?.connected) {
      setAutoAdvanced(true);
      setMsg('Encoder signal detected — continue to Go Live when ready.');
    }
  }, [signal?.connected, panel, autoAdvanced]);

  const isLive = channelState === 'LIVE';
  const isPreview = channelState === 'PREVIEW';
  const signalOk = Boolean(signal?.connected) || isLive || isPreview;

  const onGoLive = async () => {
    setBusy(true);
    setMsg(null);
    const result = await postGoLive();
    setBusy(false);
    if (!result.ok) {
      setMsg(result.error);
      return;
    }
    patchLocalChannel('LIVE');
    setMsg('You’re live. Share your channel or play it here.');
    setPanel('live');
    if (settings && slug) {
      play(
        liveChannelPlayable(slug, user?.displayName ?? slug, settings.hlsUrl),
      );
    }
    if (!isMock) {
      void refresh();
    }
  };

  // StreamManagerPanel calls postEndBroadcast itself — this just syncs the
  // local view once that succeeds.
  const handleStreamEnded = () => {
    patchLocalChannel('OFFLINE');
    setMsg('Broadcast ended.');
    setPanel('connect');
    if (!isMock) {
      void refresh();
    }
  };

  const onPlayLive = () => {
    if (!settings || !slug) {
      return;
    }
    play(liveChannelPlayable(slug, user?.displayName ?? slug, settings.hlsUrl));
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/go-live" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Go Live
            </h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Connect your encoder, publish, then optionally mirror to other
              platforms.
            </p>
          </div>
          {channelState === 'LIVE' ? (
            <OnAirBadge />
          ) : (
            <span
              className={`rounded px-3 py-1 text-xs font-bold tracking-wide uppercase ${statusTone(channelState)}`}
            >
              {channelState}
            </span>
          )}
        </div>

        <ol className="flex flex-wrap gap-2">
          {(
            [
              { id: 'connect' as const, step: 1, label: 'Connect' },
              { id: 'live' as const, step: 2, label: 'Live' },
              { id: 'multistream' as const, step: 3, label: 'Multistream' },
            ] as const
          ).map((t) => {
            const active = panel === t.id;
            const done =
              (t.id === 'connect' && signalOk) ||
              (t.id === 'live' && isLive) ||
              (t.id === 'multistream' && targets.some((x) => x.enabled));
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (t.id === 'live' && !settings) {
                      setMsg(
                        'Load stream settings first (step 1) before going live.',
                      );
                      setPanel('connect');
                      return;
                    }
                    setPanel(t.id);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                    active
                      ? 'border-primary bg-primary/15 font-semibold'
                      : 'border-border text-foreground-secondary hover:border-primary/40'
                  }`}
                >
                  {done ? (
                    <CheckCircle2Icon
                      size={14}
                      className="text-primary"
                      aria-hidden
                    />
                  ) : (
                    <span className="opacity-60">{t.step}</span>
                  )}
                  {t.label}
                </button>
              </li>
            );
          })}
        </ol>

        {msg && (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              /fail|error|could not|503|401|403/i.test(msg)
                ? 'border-red-500/40 bg-red-500/10 text-red-100'
                : 'border-border bg-background-secondary'
            }`}
            role="status"
          >
            {msg}
          </p>
        )}

        {panel === 'connect' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={ingest === 'obs' ? 'default' : 'secondary'}
                onClick={() => setIngest('obs')}
              >
                <VideoIcon size={14} aria-hidden className="mr-1.5" />
                OBS
              </Button>
              <Button
                size="sm"
                variant={ingest === 'traktor' ? 'default' : 'secondary'}
                onClick={() => setIngest('traktor')}
              >
                <HeadphonesIcon size={14} aria-hidden className="mr-1.5" />
                Traktor
              </Button>
              <Button
                size="sm"
                variant={ingest === 'icecast' ? 'default' : 'secondary'}
                onClick={() => setIngest('icecast')}
              >
                <RadioIcon size={14} aria-hidden className="mr-1.5" />
                Icecast
              </Button>
            </div>

            {!settings ? (
              <p className="text-foreground-secondary text-sm">
                Could not load stream settings. Check login / channel, or enable
                mock mode.
              </p>
            ) : ingest === 'obs' ? (
              <section className="border-border rounded-xl border p-4">
                <h2 className="font-display text-lg font-bold">
                  OBS credentials
                </h2>
                <p className="text-foreground-secondary text-xs">
                  Settings → Stream → Custom
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <CopyField label="Server" value={settings.rtmp.server} />
                  <CopyField
                    label="Stream key"
                    value={settings.rtmp.streamKey}
                  />
                  <ol className="text-foreground-secondary mt-2 list-decimal space-y-1 pl-5 text-sm">
                    <li>Paste Server + Stream key into OBS.</li>
                    <li>Click Start Streaming in OBS.</li>
                    <li>Open the Live tab and go live when signal is ready.</li>
                  </ol>
                </div>
              </section>
            ) : ingest === 'traktor' ? (
              <section className="border-border rounded-xl border p-4">
                <h2 className="font-display text-lg font-bold">
                  Traktor credentials
                </h2>
                <p className="text-foreground-secondary text-xs">
                  Preferences → Broadcasting
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <CopyField label="Address" value={settings.icecast.server} />
                  <CopyField
                    label="Mount point"
                    value={settings.icecast.mount}
                  />
                  <CopyField
                    label="Password"
                    value={settings.icecast.password}
                  />
                  <ol className="text-foreground-secondary mt-2 list-decimal space-y-1 pl-5 text-sm">
                    <li>Traktor Preferences → Broadcasting.</li>
                    <li>
                      Paste Address, Mount point, and Password into the Icecast
                      fields.
                    </li>
                    <li>Click On Air in the Broadcast panel.</li>
                  </ol>
                </div>
              </section>
            ) : (
              <section className="border-border rounded-xl border p-4">
                <h2 className="font-display text-lg font-bold">
                  Icecast credentials
                </h2>
                <p className="text-foreground-secondary text-xs">
                  Mixxx, butt, or any other Icecast-compatible source
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <CopyField label="Server" value={settings.icecast.server} />
                  <CopyField label="Mount" value={settings.icecast.mount} />
                  <CopyField
                    label="Password"
                    value={settings.icecast.password}
                  />
                  {settings.icecast.hint && (
                    <p className="text-foreground-secondary text-xs">
                      {settings.icecast.hint}
                    </p>
                  )}
                </div>
              </section>
            )}

            <div className="border-border flex flex-wrap items-center gap-3 rounded-lg border p-4">
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {signalOk ? 'Signal detected' : 'Waiting for your software…'}
                </div>
                <p className="text-foreground-secondary text-xs">
                  {signal?.connected
                    ? `${signal.codec ?? 'audio'} · ${signal.bitrateKbps ?? '—'} kbps`
                    : 'Start streaming in your app — we poll every few seconds.'}
                </p>
              </div>
              {isMock && !signalOk && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    mockSimulateSignal(true);
                    setChannelState('PREVIEW');
                    void fetchSignalStatus().then((r) => setSignal(r.data));
                  }}
                >
                  Simulate signal
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  if (!settings) {
                    setMsg(
                      'Stream settings missing — log in as an artist with a channel.',
                    );
                    return;
                  }
                  if (!signalOk && !isLive) {
                    setMsg(
                      'No encoder signal yet. Start OBS/Icecast, or use Simulate signal in mock mode.',
                    );
                    return;
                  }
                  setMsg(null);
                  setPanel('live');
                }}
                disabled={!settings}
              >
                Next: Go live →
              </Button>
            </div>
          </div>
        )}

        {panel === 'live' && (
          <div className="flex flex-col gap-4">
            {isLive ? (
              <>
                <StreamManagerPanel slug={slug} onEnded={handleStreamEnded} />
                <Button variant="secondary" onClick={onPlayLive}>
                  Play in this app
                </Button>
              </>
            ) : (
              <div className="border-border bg-background-secondary rounded-xl border p-6">
                <div className="flex items-center gap-3">
                  <RadioIcon size={28} aria-hidden />
                  <div>
                    <div className="font-display text-xl font-bold">
                      {isPreview
                        ? 'Preview — hear yourself, then go public'
                        : signalOk
                          ? 'Ready when you are'
                          : 'No signal yet'}
                    </div>
                    <p className="text-foreground-secondary text-sm">
                      Channel <code>/{slug}</code>
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    disabled={
                      busy || (!signalOk && !isPreview) || usage?.blocked
                    }
                    onClick={() => void onGoLive()}
                  >
                    <RadioIcon size={16} aria-hidden className="mr-1.5" />
                    {busy ? 'Going live…' : 'Go Live'}
                  </Button>
                  {signalOk && (
                    <Button variant="secondary" onClick={onPlayLive}>
                      Preview audio
                    </Button>
                  )}
                </div>
              </div>
            )}

            <p className="text-foreground-secondary text-xs">
              After the show, promote captures from{' '}
              <Link
                to="/studio/archive"
                className="underline-offset-2 hover:underline"
              >
                Music
              </Link>
              .
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPanel('connect')}
              >
                <ArrowLeftIcon size={14} aria-hidden className="mr-1.5" />
                Connect
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPanel('multistream')}
              >
                Multistream (optional)
              </Button>
            </div>
          </div>
        )}

        {panel === 'multistream' && (
          <div className="flex flex-col gap-4">
            <p className="text-foreground-secondary text-sm">
              Optional — mirror this show to YouTube, Twitch, and others.
            </p>

            {targets.length === 0 ? (
              <p className="text-foreground-secondary text-sm">
                No destinations yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {targets.map((t) => (
                  <li
                    key={t.id}
                    className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {t.label || t.provider}
                        <span className="text-foreground-secondary ml-2 text-xs">
                          …{t.keyLast4 ?? '????'}
                        </span>
                      </div>
                      <div className="text-foreground-secondary font-mono text-xs">
                        {t.rtmpUrl}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          void patchRtmpTarget(t.id, {
                            enabled: !t.enabled,
                          }).then(() => reload());
                        }}
                      >
                        {t.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => {
                          void deleteRtmpTarget(t.id).then(() => reload());
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowAddDest(true)}
            >
              <PlusIcon size={16} aria-hidden className="mr-1.5" />
              Add destination
            </Button>

            <Dialog.Root
              isOpen={showAddDest}
              onClose={() => {
                setShowAddDest(false);
                setNewKey('');
                setNewLabel('');
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newKey.trim()) {
                    return;
                  }
                  void createRtmpTarget({
                    provider: newProvider,
                    streamKey: newKey.trim(),
                    label: newLabel.trim() || undefined,
                    enabled: true,
                  }).then((r) => {
                    if (!r.ok) {
                      setMsg(r.error);
                    } else {
                      setNewKey('');
                      setNewLabel('');
                      setShowAddDest(false);
                      void reload();
                    }
                  });
                }}
              >
                <Dialog.Title>
                  <span className="inline-flex items-center gap-2">
                    <RadioIcon size={18} aria-hidden />
                    Add destination
                  </span>
                </Dialog.Title>
                <div className="mt-4 flex flex-col gap-3">
                  <label className="text-foreground-secondary text-xs uppercase">
                    Provider
                    <select
                      className="border-border bg-background text-foreground mt-1 w-full rounded border px-2 py-1.5 text-sm normal-case"
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value)}
                    >
                      {['YOUTUBE', 'TWITCH', 'KICK', 'FACEBOOK', 'CUSTOM'].map(
                        (p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="text-foreground-secondary text-xs uppercase">
                    Stream key
                    <span className="relative mt-1 block">
                      <KeyRoundIcon
                        size={14}
                        aria-hidden
                        className="text-foreground-secondary pointer-events-none absolute top-1/2 left-2 -translate-y-1/2"
                      />
                      <input
                        className="border-border bg-background text-foreground w-full rounded border py-1.5 pr-2 pl-8 text-sm normal-case"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder="Paste platform stream key"
                        autoFocus
                      />
                    </span>
                  </label>
                  <Input
                    label="Label (optional)"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </div>
                <Dialog.Actions>
                  <Dialog.Close>Cancel</Dialog.Close>
                  <Button type="submit" disabled={!newKey.trim()}>
                    <PlusIcon size={16} aria-hidden className="mr-1.5" />
                    Save destination
                  </Button>
                </Dialog.Actions>
              </form>
            </Dialog.Root>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPanel('live')}
              >
                <ArrowLeftIcon size={14} aria-hidden className="mr-1.5" />
                Live
              </Button>
            </div>
          </div>
        )}

        {usage && (
          <p className="text-foreground-secondary text-xs opacity-70">
            Weekly live time: {formatUsageMinutes(usage)}
            {usage.blocked ? ' — at cap' : ''}
          </p>
        )}
      </div>
    </StudioGate>
  );
}
