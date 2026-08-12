import { formatArtistNames } from '@nuclearplayer/model';
import { PlayerBar } from '@nuclearplayer/ui';

import { playableFromQueueItem, usePlayerStore } from '../stores/playerStore';

export function ConnectedPlayerBar() {
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

  const current = queue.find((q) => q.id === currentId);
  const playable = current ? playableFromQueueItem(current) : null;
  const isPlaying = status === 'playing' || status === 'loading';
  const seekProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const title = playable?.title ?? 'Nothing playing';
  const provider =
    playable?.sourceProvider && playable.sourceProvider !== 'tahti'
      ? playable.sourceProvider
      : current?.track.source.provider &&
          current.track.source.provider !== 'tahti'
        ? current.track.source.provider
        : null;
  const artistBase =
    playable?.artist ??
    (current
      ? formatArtistNames(current.track.artists)
      : 'Pick a channel to listen');
  const artist = provider ? `${artistBase}, ${provider}` : artistBase;

  return (
    <PlayerBar
      left={
        <PlayerBar.NowPlaying
          title={title}
          artist={artist}
          coverUrl={playable?.coverUrl ?? current?.track.artwork?.items[0]?.url}
        />
      }
      center={
        <div className="flex w-full max-w-xl flex-col items-center gap-1">
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
              if (isPlaying) {
                setStatus('paused');
              } else {
                setStatus('playing');
              }
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
          )}
        </div>
      }
      right={
        <PlayerBar.Volume
          value={muted ? 0 : Math.round(volume * 100)}
          onValueChange={(v) => setVolume(v / 100)}
        />
      }
    />
  );
}
