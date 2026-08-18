import { Link } from '@tanstack/react-router';
import {
  ClockIcon,
  HeartIcon,
  LibraryBigIcon,
  MessageCircleIcon,
  MicVocalIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { PageFrame } from '../components/PageHeader';
import { FavoritesView } from './FavoritesView';
import { HistoryView } from './HistoryView';
import { MessagesView } from './MessagesView';
import { MyCollectionsView } from './MyCollectionsView';
import { MyDiscographyView } from './MyDiscographyView';

type Tab = 'discography' | 'collections' | 'favorites' | 'history' | 'messages';

const ITEMS: {
  id: Tab;
  to: string;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: 'discography',
    to: '/library',
    label: 'Everything',
    icon: <LibraryBigIcon size={16} aria-hidden />,
  },
  {
    id: 'collections',
    to: '/library/collections',
    label: 'Collections',
    icon: <MicVocalIcon size={16} aria-hidden />,
  },
  {
    id: 'favorites',
    to: '/library/favorites',
    label: 'Favorites',
    icon: <HeartIcon size={16} aria-hidden />,
  },
  {
    id: 'history',
    to: '/library/history',
    label: 'History',
    icon: <ClockIcon size={16} aria-hidden />,
  },
  {
    id: 'messages',
    to: '/library/messages',
    label: 'Messages',
    icon: <MessageCircleIcon size={16} aria-hidden />,
  },
];

/** My Library — releases, catalog, playlists/DJ sets/mixes (Collections),
 * favorites, history, messages, switchable from a left-side rail. */
export function LibraryView({ tab = 'discography' }: { tab?: Tab }) {
  return (
    <PageFrame maxWidth="5xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        <nav
          aria-label="Library"
          className="flex shrink-0 gap-1 overflow-x-auto sm:w-44 sm:flex-col sm:overflow-visible"
        >
          {ITEMS.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
                tab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
              }`}
              aria-current={tab === item.id ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {tab === 'discography' && <MyDiscographyView />}
          {tab === 'collections' && <MyCollectionsView />}
          {tab === 'favorites' && <FavoritesView />}
          {tab === 'history' && <HistoryView />}
          {tab === 'messages' && <MessagesView />}
        </div>
      </div>
    </PageFrame>
  );
}
