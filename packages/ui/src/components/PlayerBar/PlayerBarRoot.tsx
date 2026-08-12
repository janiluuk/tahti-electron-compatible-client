import { FC, ReactNode } from 'react';

import { BottomBar } from '..';
import { cn } from '../../utils';

export type PlayerBarRootProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
};
export const PlayerBarRoot: FC<PlayerBarRootProps> = ({
  left,
  center,
  right,
  className = '',
}) => (
  <BottomBar className={cn('px-4', className)}>
    <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)_minmax(0,1fr)] items-center gap-4">
      <div className="min-w-0">{left}</div>
      <div className="flex w-full min-w-0 justify-center">{center}</div>
      <div className="justify-self-end">{right}</div>
    </div>
  </BottomBar>
);
