import { InPageNav } from '../components/InPageNav';
import { PageFrame } from '../components/PageHeader';
import { FavoritesView } from './FavoritesView';
import { HistoryView } from './HistoryView';
import { MessagesView } from './MessagesView';

type Tab = 'favorites' | 'history' | 'messages';

export function LibraryView({ tab = 'favorites' }: { tab?: Tab }) {
  return (
    <PageFrame>
      <InPageNav
        aria-label="Library"
        items={[
          {
            id: 'favorites',
            to: '/library',
            label: 'Favorites',
            active: tab === 'favorites',
          },
          {
            id: 'history',
            to: '/library/history',
            label: 'History',
            active: tab === 'history',
          },
          {
            id: 'messages',
            to: '/library/messages',
            label: 'Messages',
            active: tab === 'messages',
          },
        ]}
      />
      {tab === 'favorites' && <FavoritesView />}
      {tab === 'history' && <HistoryView />}
      {tab === 'messages' && <MessagesView />}
    </PageFrame>
  );
}
