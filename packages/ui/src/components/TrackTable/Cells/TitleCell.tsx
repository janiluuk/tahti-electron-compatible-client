import { CellContext } from '@tanstack/react-table';
import { EllipsisVertical, Plus } from 'lucide-react';
import { FC, forwardRef } from 'react';

import { Track } from '@nuclearplayer/model';

import { cn } from '../../../utils';
import { Button } from '../../Button';
import { useTrackTableContext } from '../TrackTableContext';
import { ContextMenuWrapperProps } from '../types';

type TitleCellMeta = {
  displayQueueControls?: boolean;
  onAddToQueue?: (track: Track) => void;
  isCurrentTrack?: (track: Track) => boolean;
  ContextMenuWrapper?: FC<ContextMenuWrapperProps>;
};

type AddToQueueButtonProps = {
  label: string;
  onClick: () => void;
};

const AddToQueueButton: FC<AddToQueueButtonProps> = ({ label, onClick }) => (
  <Button
    data-testid="add-to-queue-button"
    size="icon-sm"
    variant="text"
    className="opacity-100 transition-none [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    aria-label={label}
  >
    <Plus size={16} />
  </Button>
);

type ContextMenuButtonProps = {
  label: string;
};

const ContextMenuButton = forwardRef<HTMLElement, ContextMenuButtonProps>(
  function ContextMenuButton({ label, ...props }, ref) {
    return (
      <Button
        {...props}
        ref={ref}
        data-testid="track-context-menu-button"
        size="icon-sm"
        variant="text"
        className="opacity-100 transition-none [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
        aria-label={label}
      >
        <EllipsisVertical size={16} />
      </Button>
    );
  },
);

export const TitleCell = <T extends Track>({
  getValue,
  row,
  table,
}: CellContext<T, string | number | undefined>) => {
  const meta = table.options.meta as TitleCellMeta | undefined;
  const { actions, labels } = useTrackTableContext<T>();
  const showControls = meta?.displayQueueControls;
  const ContextMenuWrapper = meta?.ContextMenuWrapper;
  const track = row.original;
  const hasAddToQueue = Boolean(meta?.onAddToQueue);
  const hasContextMenu = Boolean(ContextMenuWrapper);
  const hasActions = hasAddToQueue || hasContextMenu;
  const isCurrent = meta?.isCurrentTrack?.(track) ?? false;

  return (
    <td className="truncate px-2">
      <div className="flex items-center justify-between gap-2">
        <button
          className={cn(
            'min-w-0 flex-1 cursor-pointer truncate text-left hover:underline',
            isCurrent && 'text-primary font-semibold',
          )}
          onClick={(e) => {
            e.stopPropagation();
            actions.onPlayNow?.(track);
          }}
        >
          {getValue()}
        </button>
        {showControls && hasActions && (
          <div className="flex items-center gap-1">
            {hasAddToQueue && (
              <AddToQueueButton
                label={labels.addToQueue}
                onClick={() => meta?.onAddToQueue?.(track)}
              />
            )}
            {ContextMenuWrapper && (
              <ContextMenuWrapper track={track}>
                <ContextMenuButton label={labels.trackOptions} />
              </ContextMenuWrapper>
            )}
          </div>
        )}
      </div>
    </td>
  );
};
