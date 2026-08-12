import { Link } from '@tanstack/react-router';
import {
  Disc3Icon,
  DiscAlbumIcon,
  LibraryIcon,
  ListMusicIcon,
  PlusIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  createStudioCollection,
  fetchStudioCollections,
} from '../../api/studio';
import type { StudioCollection } from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const CREATE_STYLES = [
  { id: 'ALBUM', label: 'Album', icon: <Disc3Icon size={18} aria-hidden /> },
  { id: 'EP', label: 'EP', icon: <DiscAlbumIcon size={18} aria-hidden /> },
  {
    id: 'PLAYLIST',
    label: 'Playlist',
    icon: <ListMusicIcon size={18} aria-hidden />,
  },
  {
    id: 'COMPILATION',
    label: 'Compilation',
    icon: <LibraryIcon size={18} aria-hidden />,
  },
] as const;

type CreateStyle = (typeof CREATE_STYLES)[number]['id'];

export function StudioCollectionsView() {
  const [rows, setRows] = useState<StudioCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [style, setStyle] = useState<CreateStyle>('ALBUM');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    void fetchStudioCollections().then((res) => {
      setRows(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const closeCreate = () => {
    setCreateOpen(false);
    setName('');
    setStyle('ALBUM');
    setBusy(false);
  };

  const submitCreate = () => {
    if (!name.trim() || busy) {
      return;
    }
    setBusy(true);
    setMsg(null);
    void createStudioCollection({
      name: name.trim(),
      style,
    }).then((r) => {
      setBusy(false);
      if (!r.ok) {
        setMsg(r.error);
        return;
      }
      setMsg(`Created ${r.data.name} — open designer to add tracks.`);
      closeCreate();
      reload();
    });
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/collections" />
        <StudioPageHeader
          title="Albums"
          subtitle="Design albums and compilations. For playlists with visibility and collab, use Playlists."
          action={
            <div className="flex flex-wrap gap-2">
              <Link to="/studio/playlists">
                <Button size="sm" variant="secondary">
                  Playlists
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => {
                  setMsg(null);
                  setCreateOpen(true);
                }}
                aria-label="New album"
                title="New album"
              >
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                New
              </Button>
            </div>
          }
        />

        {msg && <p className="text-sm">{msg}</p>}

        <Dialog.Root isOpen={createOpen} onClose={closeCreate}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate();
            }}
          >
            <Dialog.Title>
              <span className="inline-flex items-center gap-2">
                <PlusIcon size={18} aria-hidden />
                New album / playlist
              </span>
            </Dialog.Title>
            <Dialog.Description>
              Choose a type and give it a title.
            </Dialog.Description>
            <div className="mt-4 flex flex-col gap-3">
              <Input
                label="Title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                {CREATE_STYLES.map((s) => (
                  <StyleChip
                    key={s.id}
                    selected={style === s.id}
                    icon={s.icon}
                    label={s.label}
                    onClick={() => setStyle(s.id)}
                  />
                ))}
              </div>
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button type="submit" disabled={!name.trim() || busy}>
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Creating…' : 'Create'}
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Root>

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-foreground-secondary text-sm">
                No albums yet — create one to design a tracklist.
              </p>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                New album
              </Button>
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {rows.map((c) => (
                <li
                  key={c.slug}
                  className="flex items-center gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  {c.coverUrl ? (
                    <img
                      src={c.coverUrl}
                      alt=""
                      className="border-border h-12 w-12 rounded-lg border object-cover shadow-sm"
                    />
                  ) : (
                    <div className="border-border bg-background flex h-12 w-12 items-center justify-center rounded-lg border">
                      <Disc3Icon size={18} className="opacity-40" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-foreground-secondary text-xs">
                      /{c.slug}
                      {c.style ? `, ${c.style}` : ''}
                      {typeof c.itemCount === 'number'
                        ? `, ${c.itemCount} items`
                        : c.items
                          ? `, ${c.items.length} items`
                          : ''}
                      {c.isPublic === false ? ', private' : ''}
                    </p>
                  </div>
                  <Link
                    to="/studio/collections/$slug"
                    params={{ slug: c.slug }}
                  >
                    <Button size="sm">
                      {c.style === 'ALBUM' || c.style === 'EP'
                        ? 'Design'
                        : 'Edit'}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </StudioGate>
  );
}

function StyleChip({
  selected,
  icon,
  label,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${
        selected
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border text-foreground-secondary'
      }`}
      onClick={onClick}
      aria-pressed={selected}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
