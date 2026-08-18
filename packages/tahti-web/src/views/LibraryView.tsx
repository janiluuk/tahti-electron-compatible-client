import { InPageNav } from '../components/InPageNav';
import { PageFrame } from '../components/PageHeader';
import { FavoritesView } from './FavoritesView';
import { HistoryView } from './HistoryView';
import { MessagesView } from './MessagesView';
import { MyDiscographyView } from './MyDiscographyView';

type Tab = 'discography' | 'favorites' | 'history' | 'messages';

export function LibraryView({ tab = 'discography' }: { tab?: Tab }) {
  return (
    <PageFrame>
      <InPageNav
        aria-label="Library"
        items={[
          {
            id: 'discography',
            to: '/library',
            label: 'Discography',
            active: tab === 'discography',
          },
          {
            id: 'favorites',
            to: '/library/favorites',
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
      {tab === 'discography' && <MyDiscographyView />}
      {tab === 'favorites' && <FavoritesView />}
      {tab === 'history' && <HistoryView />}
      {tab === 'messages' && <MessagesView />}
    </PageFrame>
  );
}
