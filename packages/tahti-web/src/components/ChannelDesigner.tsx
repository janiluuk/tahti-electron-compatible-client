import {
  AudioLines,
  Cloud,
  Droplets,
  Flashlight,
  Grid3x3,
  Slash,
  Sparkles,
  Spline,
  Square,
  Sun,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, PluginItem, Tabs, Toggle } from '@nuclearplayer/ui';

import {
  BRAND_ACCENTS,
  fetchChannelVisual,
  HEADER_STYLES,
  parseColorScheme,
  patchChannelVisual,
  VISUAL_PRESETS,
  type ChannelVisual,
  type ColorScheme,
  type VisualPreset,
} from '../api/channel-design';

const PRESET_META: Record<
  VisualPreset,
  { description: string; Icon: LucideIcon }
> = {
  MINIMAL: {
    description: 'No animated background — solid color only.',
    Icon: Slash,
  },
  WATER_RIPPLE: {
    description: 'Soft ripple distortion synced to audio level.',
    Icon: Droplets,
  },
  WAVEFORM_BARS: {
    description: 'Classic frequency bars across the bottom.',
    Icon: AudioLines,
  },
  PARTICLE_FIELD: {
    description: 'Drifting particles that pulse with the beat.',
    Icon: Sparkles,
  },
  AURORA: {
    description: 'Flowing aurora-style color bands.',
    Icon: Waves,
  },
  REACTIVE_GRID: {
    description: 'Pulsing grid lines that react to the mix.',
    Icon: Grid3x3,
  },
  CLOUDSCAPE: {
    description: 'Slow-moving cloud gradients.',
    Icon: Cloud,
  },
  LINE_TANGLE: {
    description: 'Tangled line art that reacts to levels.',
    Icon: Spline,
  },
  BACKDROP_BOX: {
    description: 'Boxed grid backdrop, subtle motion.',
    Icon: Square,
  },
  LENS_FLARES: {
    description: 'Soft lens-flare glints over the artwork.',
    Icon: Sun,
  },
  IES_SPOTLIGHT: {
    description: 'Spotlight-style beam sweep.',
    Icon: Flashlight,
  },
};

const isVisualPreset = (value: string): value is VisualPreset =>
  VISUAL_PRESETS.some((preset) => preset === value);

type Props = {
  displayName: string;
  username: string;
  channelSlug?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  /** Compact for profile tab; full for Studio. */
  compact?: boolean;
  /** Side-panel look controls only (no hero preview chrome). */
  lookOnly?: boolean;
  onSaved?: () => void;
  /** Remount / reload trigger when an external preset applies a look. */
  reloadToken?: number;
};

export function ChannelDesigner({
  displayName,
  username,
  channelSlug,
  avatarUrl,
  bio,
  compact,
  lookOnly,
  onSaved,
  reloadToken = 0,
}: Props) {
  const [visual, setVisual] = useState<ChannelVisual | null>(null);
  const [scheme, setScheme] = useState<ColorScheme>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastVisualizerPreset, setLastVisualizerPreset] =
    useState<VisualPreset>('AURORA');

  useEffect(() => {
    void fetchChannelVisual().then((r) => {
      setVisual(r.data);
      setScheme(parseColorScheme(r.data.colorSchemeJson));
      if (
        isVisualPreset(r.data.visualPreset) &&
        r.data.visualPreset !== 'MINIMAL'
      ) {
        setLastVisualizerPreset(r.data.visualPreset);
      }
      setDirty(false);
    });
  }, [reloadToken]);

  const previewStyle = useMemo(() => {
    const accent = scheme.accent ?? '#22D3EE';
    const highlight = scheme.highlight ?? '#A78BFA';
    const bg = scheme.background ?? '#0B1220';
    const fg = scheme.foreground ?? '#F8FAFC';
    const brand = BRAND_ACCENTS.find((b) => b.id === visual?.brandAccentPreset);
    const gradient =
      visual?.headerStyle === 'SOLID'
        ? bg
        : (brand?.gradient ??
          `linear-gradient(135deg, ${highlight}, ${accent}, ${bg})`);
    return { accent, highlight, bg, fg, gradient };
  }, [scheme, visual?.brandAccentPreset, visual?.headerStyle]);

  const applyLocal = (
    next: Partial<ChannelVisual>,
    nextScheme?: ColorScheme,
  ) => {
    setVisual((v) => (v ? { ...v, ...next } : v));
    if (nextScheme) {
      setScheme(nextScheme);
    }
    setDirty(true);
  };

  const save = async () => {
    if (!visual) {
      return;
    }
    setBusy(true);
    setMsg(null);
    const result = await patchChannelVisual({
      visualPreset: visual.visualPreset,
      headerStyle: visual.headerStyle,
      brandAccentPreset: visual.brandAccentPreset,
      colorScheme: scheme,
    });
    setBusy(false);
    if (!result.ok) {
      setMsg(result.error);
      return;
    }
    setVisual(result.data);
    setScheme(parseColorScheme(result.data.colorSchemeJson));
    setDirty(false);
    setMsg('Look saved — public channel will pick this up.');
    onSaved?.();
  };

  if (!visual) {
    return (
      <p className="text-foreground-secondary text-sm">Loading designer…</p>
    );
  }

  const visualizerEnabled = visual.visualPreset !== 'MINIMAL';

  const setVisualizerEnabled = (enabled: boolean) => {
    if (
      !enabled &&
      isVisualPreset(visual.visualPreset) &&
      visual.visualPreset !== 'MINIMAL'
    ) {
      setLastVisualizerPreset(visual.visualPreset);
    }
    applyLocal({
      visualPreset: enabled ? lastVisualizerPreset : 'MINIMAL',
    });
  };

  const controls = (
    <>
      <Tabs
        listClassName="flex-wrap border-border border-b pb-3"
        panelClassName="pt-2"
        items={[
          {
            id: 'visualizer',
            label: 'Visualizer',
            content: (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={visualizerEnabled}
                    onChange={setVisualizerEnabled}
                    aria-label="Use visualizer"
                  />
                  <span className="text-sm font-semibold">Use visualizer</span>
                </div>
                {visualizerEnabled && (
                  <div className="flex flex-col gap-2">
                    {VISUAL_PRESETS.filter(
                      (preset) => preset !== 'MINIMAL',
                    ).map((preset) => {
                      const meta = PRESET_META[preset];
                      const active = visual.visualPreset === preset;
                      return (
                        <PluginItem
                          key={preset}
                          icon={<meta.Icon size={22} aria-hidden />}
                          name={preset.replace(/_/g, ' ')}
                          author={active ? 'In use' : 'Visualizer'}
                          description={meta.description}
                          labels={{ by: '' }}
                          className={
                            active
                              ? 'ring-primary bg-primary/10 ring-2 ring-inset'
                              : undefined
                          }
                          rightAccessory={
                            <Button
                              size="sm"
                              variant={active ? undefined : 'secondary'}
                              disabled={active}
                              onClick={() => {
                                setLastVisualizerPreset(preset);
                                applyLocal({ visualPreset: preset });
                              }}
                            >
                              {active ? 'In use' : 'Use'}
                            </Button>
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            ),
          },
          {
            id: 'colors',
            label: 'Colors',
            content: (
              <section className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-lg font-bold tracking-tight">
                    Brand accent
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {BRAND_ACCENTS.map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        title={brand.label}
                        aria-label={brand.label}
                        aria-pressed={visual.brandAccentPreset === brand.id}
                        onClick={() =>
                          applyLocal(
                            { brandAccentPreset: brand.id },
                            {
                              ...scheme,
                              accent: brand.accent,
                              highlight: brand.highlight,
                            },
                          )
                        }
                        className={`h-10 w-16 rounded-md border-2 transition-transform hover:scale-105 ${
                          visual.brandAccentPreset === brand.id
                            ? 'border-primary shadow-md'
                            : 'border-transparent'
                        }`}
                        style={{ background: brand.gradient }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ['accent', 'Accent'] as const,
                      ['highlight', 'Highlight'] as const,
                      ['background', 'Background'] as const,
                      ['foreground', 'Foreground'] as const,
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="border-border bg-background-secondary/40 flex items-center gap-3 rounded-lg border p-3 text-sm"
                    >
                      <input
                        type="color"
                        value={scheme[key] ?? '#22D3EE'}
                        onChange={(event) => {
                          const next = { ...scheme, [key]: event.target.value };
                          applyLocal({}, next);
                        }}
                        className="h-9 w-11 cursor-pointer rounded border-0 bg-transparent"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {label}
                        </span>
                        <code className="text-foreground-secondary text-xs">
                          {scheme[key]}
                        </code>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            ),
          },
          {
            id: 'header',
            label: 'Header',
            content: (
              <section className="flex flex-col gap-3">
                <h3 className="font-display text-lg font-bold tracking-tight">
                  Header style
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {HEADER_STYLES.map((headerStyle) => {
                    const active = visual.headerStyle === headerStyle;
                    return (
                      <button
                        key={headerStyle}
                        type="button"
                        aria-pressed={active}
                        onClick={() => applyLocal({ headerStyle })}
                        className={`rounded-lg border p-4 text-left text-sm font-semibold tracking-wide uppercase transition-colors ${
                          active
                            ? 'border-primary bg-primary/10 ring-primary ring-1'
                            : 'border-border bg-background hover:bg-background-secondary text-foreground-secondary hover:text-foreground'
                        }`}
                      >
                        {headerStyle.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </section>
            ),
          },
        ]}
      />

      <div className="border-border flex flex-wrap items-center gap-3 border-t pt-4">
        <Button size="sm" disabled={busy || !dirty} onClick={() => void save()}>
          {busy ? 'Saving…' : dirty ? 'Save look' : 'Saved'}
        </Button>
        {msg && <p className="text-foreground-secondary text-sm">{msg}</p>}
      </div>
    </>
  );

  if (lookOnly) {
    return <div className="flex flex-col gap-3">{controls}</div>;
  }

  return (
    <div className={`flex flex-col gap-4 ${compact ? '' : 'max-w-3xl'}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">
            Design your channel
          </h2>
          <p className="text-foreground-secondary text-xs">
            Prefer editing on the live channel page — open your channel and hit
            Edit design.
          </p>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-xl border border-white/10 p-5 shadow-lg"
        style={{ background: previewStyle.gradient, color: previewStyle.fg }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: previewStyle.bg }}
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 text-lg font-bold"
            style={{
              borderColor: previewStyle.accent,
              background: previewStyle.bg,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              displayName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-2xl font-extrabold tracking-tight">
              {displayName}
            </div>
            <div className="text-sm opacity-80">
              @{username}
              {channelSlug ? ` · /${channelSlug}` : ''}
            </div>
            {bio && (
              <p className="mt-1 line-clamp-2 text-sm opacity-90">{bio}</p>
            )}
          </div>
          <span
            className="rounded px-2 py-1 text-[10px] font-bold tracking-wide uppercase"
            style={{ background: previewStyle.accent, color: '#0B1220' }}
          >
            {visual.visualPreset.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="relative mt-4 flex h-10 items-end gap-0.5">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm opacity-80"
              style={{
                height: `${20 + ((i * 17) % 70)}%`,
                background:
                  i % 2 === 0 ? previewStyle.accent : previewStyle.highlight,
              }}
            />
          ))}
        </div>
      </div>

      {controls}
    </div>
  );
}
