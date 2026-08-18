import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatArtistNames } from '@nuclearplayer/model';
import { Button, cn, PlayerBar } from '@nuclearplayer/ui';

import { useDominantColor } from '../lib/useDominantColor';
import { useLayoutStore } from '../stores/layoutStore';
import { playableFromQueueItem, usePlayerStore } from '../stores/playerStore';
import { ChannelVisualizer } from './ChannelVisualizer';

const ANIMATION_MS = 280;

/** Full-viewport now-playing overlay — expand button in the player bar
 * opens it, X or Escape closes it back to the compact bar. Backdrop tint
 * follows the current track's cover art (sampled via useDominantColor)
 * since there's no per-track/channel colour override wired up for
 * arbitrary queue items yet — see the commit note for why that's
 * deliberately out of scope here. */
export function FullScreenPlayer() {
  const open = useLayoutStore((s) => s.fullScreenPlayerOpen);
  const setOpen = useLayoutStore((s) => s.setFullScreenPlayerOpen);
  const queue = usePlayerStore((s) => s.queue);
  const currentId = usePlayerStore((s) => s.currentId);
  const status = usePlayerStore((s) => s.status);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const isLive = usePlayerStore((s) => s.isLive);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const setStatus = usePlayerStore((s) => s.setStatus);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const seekTo = usePlayerStore((s) => s.seekTo);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), ANIMATION_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, setOpen]);

  const current = queue.find((q) => q.id === currentId);
  const playable = current ? playableFromQueueItem(current) : null;
  const coverUrl = playable?.coverUrl ?? current?.track.artwork?.items[0]?.url;
  const title = playable?.title ?? 'Nothing playing';
  const artist =
    playable?.artist ??
    (current ? formatArtistNames(current.track.artists) : '');
  const isPlaying = status === 'playing' || status === 'loading';
  const seekProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const rgb = useDominantColor(coverUrl);

  if (!mounted) {
    return null;
  }

  // background-color (opaque) + background-image (the tint) as two
  // separate properties -- the shorthand `background: <gradient>` was
  // replacing the element's only opaque layer with one whose center
  // stop is 35% alpha, so the page underneath showed straight through
  // the middle of the fixed overlay instead of being covered by it.
  const bgStyle = rgb
    ? {
        backgroundColor: 'var(--background)',
        backgroundImage: `radial-gradient(circle at 50% 20%, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.35), transparent 70%)`,
      }
    : undefined;

  return (
    <div
      className={cn(
        'bg-background fixed inset-0 z-50 flex flex-col overflow-hidden transition-all',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
      style={{ ...bgStyle, transitionDuration: `${ANIMATION_MS}ms` }}
      role="dialog"
      aria-modal="true"
      aria-label="Now playing, full screen"
    >
      <div className="absolute inset-0 opacity-30">
        <ChannelVisualizer className="h-full w-full" artworkUrl={coverUrl} />
      </div>

      <div className="relative z-10 flex justify-end p-4">
        <Button
          size="icon-sm"
          variant="text"
          onClick={() => setOpen(false)}
          aria-label="Minimize player"
          title="Minimize"
        >
          <XIcon size={20} aria-hidden />
        </Button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-6 pb-10">
        <div className="border-border bg-background-secondary aspect-square w-64 shrink-0 overflow-hidden rounded-xl border shadow-2xl sm:w-80 md:w-96">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="size-full object-cover" />
          ) : null}
        </div>

        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {artist && (
            <p className="text-foreground-secondary mt-1 text-lg">{artist}</p>
          )}
        </div>

        <div className="flex w-full max-w-md flex-col items-center gap-2">
          <PlayerBar.Controls
            isPlaying={isPlaying}
            isShuffleActive={!isLive && shuffle}
            repeatMode={isLive ? 'off' : repeatMode}
            showDiscovery={false}
            labels={{
              shuffleOn: isLive ? 'Shuffle (archive only)' : 'Shuffle on',
              shuffleOff: isLive ? 'Shuffle (archive only)' : 'Shuffle off',
              repeatOff: isLive ? 'Repeat (archive only)' : 'Repeat off',
              repeatAll: 'Repeat all',
              repeatOne: 'Repeat one',
            }}
            onPlayPause={() => {
              if (!playable) {
                return;
              }
              setStatus(isPlaying ? 'paused' : 'playing');
            }}
            onNext={next}
            onPrevious={previous}
            onShuffleToggle={toggleShuffle}
            onRepeatToggle={cycleRepeat}
          />
          {isLive ? (
            <div className="text-foreground-secondary text-xs tracking-wide uppercase">
              {status === 'error' ? 'Error' : 'Live — no seek'}
            </div>
          ) : (
            <div className="w-full">
              <PlayerBar.SeekBar
                progress={seekProgress}
                elapsedSeconds={currentTime}
                remainingSeconds={Math.max(0, duration - currentTime)}
                isLoading={status === 'loading'}
                onSeek={(percent) => {
                  if (duration <= 0) {
                    return;
                  }
                  seekTo((percent / 100) * duration);
                }}
              />
            </div>
          )}
          <PlayerBar.Volume
            value={muted ? 0 : Math.round(volume * 100)}
            onValueChange={(v) => setVolume(v / 100)}
          />
        </div>
      </div>
    </div>
  );
}
