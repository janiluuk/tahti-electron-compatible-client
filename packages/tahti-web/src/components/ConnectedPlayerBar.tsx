import { ChevronDownIcon, ListMusicIcon, XIcon } from 'lucide-react';

import { formatArtistNames } from '@nuclearplayer/model';
import { Button, cn, PlayerBar } from '@nuclearplayer/ui';

import { archiveItemIdFromPlayableId } from '../lib/archiveId';
import { useLayoutStore } from '../stores/layoutStore';
import { playableFromQueueItem, usePlayerStore } from '../stores/playerStore';
import { AddToPlaylistButton } from './AddToPlaylistButton';
import { BottomQueueStrip } from './BottomQueueStrip';

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
  const playerBarVisible = usePlayerStore((s) => s.playerBarVisible);
  const setStatus = usePlayerStore((s) => s.setStatus);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const hidePlayerBar = usePlayerStore((s) => s.hidePlayerBar);
  const queueOpen = useLayoutStore((s) => s.bottomQueueOpen);
  const setBottomQueueOpen = useLayoutStore((s) => s.setBottomQueueOpen);

  const current = queue.find((q) => q.id === currentId);
  const playable = current ? playableFromQueueItem(current) : null;
  const isPlaying = status === 'playing' || status === 'loading';
  const seekProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!playerBarVisible) {
    return null;
  }

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
  const archiveItemId = archiveItemIdFromPlayableId(playable?.id ?? currentId);

  const controls = (
    <div className="flex flex-col items-center gap-1">
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
  );

  return (
    <PlayerBar
      className={cn(queueOpen && 'h-auto min-h-16 items-stretch py-2')}
      left={
        queueOpen ? undefined : (
          <div className="flex min-w-0 items-center gap-2">
            <PlayerBar.NowPlaying
              title={title}
              artist={artist}
              coverUrl={
                playable?.coverUrl ?? current?.track.artwork?.items[0]?.url
              }
            />
            {archiveItemId && playable && (
              <AddToPlaylistButton
                archiveItemId={archiveItemId}
                trackTitle={playable.title}
                variant="secondary"
              />
            )}
          </div>
        )
      }
      center={
        <div
          className={cn(
            'flex w-full flex-col items-center',
            queueOpen ? 'max-w-none min-w-0' : 'max-w-xl',
          )}
        >
          {queueOpen ? <BottomQueueStrip controls={controls} /> : controls}
        </div>
      }
      right={
        <div className="flex items-center gap-2">
          <Button
            size="icon-sm"
            variant={queueOpen ? 'secondary' : 'text'}
            onClick={() => setBottomQueueOpen(!queueOpen)}
            title={queueOpen ? 'Close queue' : 'Open queue'}
            aria-label={queueOpen ? 'Close queue' : 'Open queue'}
            aria-pressed={queueOpen}
            data-testid={queueOpen ? 'close-bottom-queue' : 'open-bottom-queue'}
          >
            {queueOpen ? <XIcon size={16} /> : <ListMusicIcon size={16} />}
          </Button>
          {!queueOpen && queue.length > 0 && (
            <span className="text-foreground-secondary text-xs tabular-nums">
              {queue.length}
            </span>
          )}
          <PlayerBar.Volume
            value={muted ? 0 : Math.round(volume * 100)}
            onValueChange={(v) => setVolume(v / 100)}
          />
          <Button
            size="icon-sm"
            variant="text"
            onClick={() => {
              setBottomQueueOpen(false);
              hidePlayerBar();
            }}
            title="Hide player"
            aria-label="Hide player"
            data-testid="hide-player-bar"
          >
            <ChevronDownIcon size={16} />
          </Button>
        </div>
      }
    />
  );
}
