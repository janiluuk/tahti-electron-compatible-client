import { Link } from '@tanstack/react-router';
import { CheckIcon, CopyIcon, RadioIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

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
  postEndBroadcast,
  postGoLive,
  type BroadcastUsage,
  type RtmpTarget,
  type SignalStatus,
  type StreamSettings,
} from '../../api/broadcast';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { useAuthStore } from '../../stores/authStore';
import { usePlayerStore } from '../../stores/playerStore';

type Ingest = 'obs' | 'icecast';
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
      <div className="text-foreground-secondary text-xs tracking-wide uppercase">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <code className="text-foreground flex-1 truncate text-sm">{value}</code>
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
  if (state === 'LIVE') {
    return 'bg-primary text-foreground';
  }
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
  const [metaSource, setMetaSource] = useState('…');
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
    setMetaSource(s.meta.source);
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

  const onEnd = async () => {
    setBusy(true);
    setMsg(null);
    const result = await postEndBroadcast();
    setBusy(false);
    if (!result.ok) {
      setMsg(result.error);
      return;
    }
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
              Broadcast wizard
            </h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Three steps: connect your encoder, go live, then optionally
              multistream. Source: {metaSource}.
            </p>
          </div>
          <span
            className={`rounded px-3 py-1 text-xs font-bold tracking-wide uppercase ${statusTone(channelState)}`}
          >
            {channelState}
          </span>
        </div>

        {usage && (
          <p className="text-foreground-secondary text-xs">
            Weekly live time: {formatUsageMinutes(usage)}
            {usage.blocked ? ' — at cap' : ''}
          </p>
        )}

        <ol className="border-border grid gap-2 rounded-xl border p-3 sm:grid-cols-3">
          {(
            [
              {
                id: 'connect' as const,
                step: 1,
                label: 'Connect',
                hint: 'Ingest keys + signal',
              },
              {
                id: 'live' as const,
                step: 2,
                label: 'Go live',
                hint: 'Publish the channel',
              },
              {
                id: 'multistream' as const,
                step: 3,
                label: 'Multistream',
                hint: 'Optional mirrors',
              },
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
                  className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left ${
                    active
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-foreground-secondary text-[10px] tracking-wide uppercase">
                    Step {t.step}
                    {done ? ' · done' : ''}
                  </span>
                  <span className="text-sm font-semibold">{t.label}</span>
                  <span className="text-foreground-secondary text-xs">
                    {t.hint}
                  </span>
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
                OBS / RTMP
              </Button>
              <Button
                size="sm"
                variant={ingest === 'icecast' ? 'default' : 'secondary'}
                onClick={() => setIngest('icecast')}
              >
                Icecast (Mixxx / butt)
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
            ) : (
              <section className="border-border rounded-xl border p-4">
                <h2 className="font-display text-lg font-bold">
                  Icecast credentials
                </h2>
                <p className="text-foreground-secondary text-xs">
                  Mixxx, Traktor, butt
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

            <ul className="text-foreground-secondary space-y-1 text-xs">
              <li>{settings ? '✓' : '○'} Stream settings loaded</li>
              <li>{signalOk ? '✓' : '○'} Encoder signal</li>
              <li>{!usage?.blocked ? '✓' : '○'} Weekly live quota available</li>
            </ul>

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
            <div
              className={`rounded-xl border p-6 ${
                isLive
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <RadioIcon
                  size={28}
                  className={isLive ? 'text-primary' : undefined}
                />
                <div>
                  <div className="font-display text-xl font-bold">
                    {isLive
                      ? 'You’re on air'
                      : isPreview
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
                {!isLive && (
                  <Button
                    disabled={
                      busy || (!signalOk && !isPreview) || usage?.blocked
                    }
                    onClick={() => void onGoLive()}
                  >
                    {busy ? 'Going live…' : 'Go Live'}
                  </Button>
                )}
                {isLive && (
                  <>
                    <Button onClick={onPlayLive}>Play in this app</Button>
                    <Link to="/channel/$slug" params={{ slug }}>
                      <Button variant="secondary">Open public channel</Button>
                    </Link>
                    <Button
                      variant="text"
                      disabled={busy}
                      onClick={() => void onEnd()}
                    >
                      End broadcast
                    </Button>
                  </>
                )}
                {!isLive && signalOk && (
                  <Button variant="secondary" onClick={onPlayLive}>
                    Preview audio
                  </Button>
                )}
              </div>
            </div>

            <p className="text-foreground-secondary text-xs">
              After the show, promote captures from{' '}
              <Link
                to="/studio/archive"
                className="underline-offset-2 hover:underline"
              >
                Music
              </Link>{' '}
              or Sources → From broadcast. Multistream destinations are optional
              — configure them before or during a show.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPanel('connect')}
              >
                ← Back
              </Button>
              <Button size="sm" onClick={() => setPanel('multistream')}>
                Next: Multistream →
              </Button>
            </div>
          </div>
        )}

        {panel === 'multistream' && (
          <div className="flex flex-col gap-4">
            <p className="text-foreground-secondary text-sm">
              Mirror this Tahti show to YouTube, Twitch, and others. Paste each
              platform’s stream key — not a Tahti API key.
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

            <section className="border-border rounded-xl border p-4">
              <h2 className="font-display text-lg font-bold">
                Add destination
              </h2>
              <p className="text-foreground-secondary text-xs">
                Secondary step — not required to go live
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <label className="text-foreground-secondary text-xs uppercase">
                  Provider
                  <select
                    className="border-border bg-background text-foreground mt-1 w-full rounded border px-2 py-1.5 text-sm"
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
                  <input
                    className="border-border bg-background text-foreground mt-1 w-full rounded border px-2 py-1.5 text-sm"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Paste platform stream key"
                  />
                </label>
                <label className="text-foreground-secondary text-xs uppercase">
                  Label (optional)
                  <input
                    className="border-border bg-background text-foreground mt-1 w-full rounded border px-2 py-1.5 text-sm"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </label>
                <Button
                  size="sm"
                  disabled={!newKey.trim()}
                  onClick={() => {
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
                        void reload();
                      }
                    });
                  }}
                >
                  Add destination
                </Button>
              </div>
            </section>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPanel('live')}
              >
                ← Back to live
              </Button>
              {isLive && (
                <p className="text-foreground-secondary self-center text-xs">
                  Wizard complete — you’re on air
                  {targets.some((x) => x.enabled)
                    ? ' with multistream destinations.'
                    : '.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </StudioGate>
  );
}
