import { NewspaperIcon, PlusIcon, SendIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  createArtistPost,
  createNewsletterDraft,
  deleteArtistPost,
  fetchArtistPosts,
  fetchNewsletterDrafts,
  sendNewsletterDraft,
  type ArtistPost,
  type NewsletterDraft,
} from '../../api/studio-extras';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

type Tab = 'posts' | 'newsletter';

export function StudioUpdatesView() {
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<ArtistPost[]>([]);
  const [drafts, setDrafts] = useState<NewsletterDraft[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [postOpen, setPostOpen] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [nlSubject, setNlSubject] = useState('');
  const [nlBody, setNlBody] = useState('');
  const [nlFansOnly, setNlFansOnly] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    void Promise.all([fetchArtistPosts(), fetchNewsletterDrafts()]).then(
      ([p, n]) => {
        setPosts(p.data);
        setDrafts(n.data);
      },
    );
  };

  useEffect(() => {
    reload();
  }, []);

  const closePost = () => {
    setPostOpen(false);
    setPostTitle('');
    setPostBody('');
    setBusy(false);
  };

  const closeDraft = () => {
    setDraftOpen(false);
    setNlSubject('');
    setNlBody('');
    setNlFansOnly(false);
    setBusy(false);
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/updates" />
        <StudioPageHeader
          title="Updates"
          subtitle="Post to your fans and send newsletter drafts."
          action={
            tab === 'posts' ? (
              <Button
                size="sm"
                onClick={() => {
                  setMsg(null);
                  setPostOpen(true);
                }}
                aria-label="New post"
                title="New post"
              >
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                New post
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setMsg(null);
                  setDraftOpen(true);
                }}
                aria-label="New draft"
                title="New draft"
              >
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                New draft
              </Button>
            )
          }
        />

        <nav className="flex flex-wrap gap-2" role="tablist">
          {(
            [
              { id: 'posts' as const, label: 'Posts', icon: NewspaperIcon },
              {
                id: 'newsletter' as const,
                label: 'Newsletter',
                icon: SendIcon,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
                tab === t.id
                  ? 'bg-primary text-foreground shadow-sm'
                  : 'border-border text-foreground-secondary hover:text-foreground border'
              }`}
            >
              <t.icon size={14} aria-hidden />
              {t.label}
            </button>
          ))}
        </nav>

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        {tab === 'posts' && (
          <StudioPanel>
            {posts.length === 0 ? (
              <div className="flex flex-col gap-3 py-4 text-center">
                <p className="text-foreground-secondary text-sm">
                  No posts yet.
                </p>
                <div>
                  <Button size="sm" onClick={() => setPostOpen(true)}>
                    <PlusIcon size={16} aria-hidden className="mr-1.5" />
                    New post
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="divide-border divide-y">
                {posts.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{p.title || 'Untitled'}</div>
                      <p className="text-foreground-secondary mt-1 whitespace-pre-wrap">
                        {p.body}
                      </p>
                      <p className="text-foreground-secondary mt-1 text-xs">
                        {new Date(p.publishAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label="Delete post"
                      title="Delete"
                      onClick={() => {
                        void deleteArtistPost(p.id).then((r) => {
                          if (!r.ok) {
                            setMsg(r.error);
                          } else {
                            reload();
                          }
                        });
                      }}
                    >
                      <Trash2Icon size={16} aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </StudioPanel>
        )}

        {tab === 'newsletter' && (
          <StudioPanel>
            {drafts.length === 0 ? (
              <div className="flex flex-col gap-3 py-4 text-center">
                <p className="text-foreground-secondary text-sm">
                  No drafts yet.
                </p>
                <div>
                  <Button size="sm" onClick={() => setDraftOpen(true)}>
                    <PlusIcon size={16} aria-hidden className="mr-1.5" />
                    New draft
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="divide-border divide-y">
                {drafts.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{d.subject}</div>
                      {d.bodyMd && (
                        <p className="text-foreground-secondary mt-1 whitespace-pre-wrap">
                          {d.bodyMd}
                        </p>
                      )}
                      <p className="text-foreground-secondary mt-1 text-xs">
                        {d.subscribersOnly ? 'Fans only' : 'All subscribers'}
                        {d.state ? `, ${d.state}` : ''}
                        {d.sentAt
                          ? `, sent ${new Date(d.sentAt).toLocaleString()}`
                          : ', draft'}
                      </p>
                    </div>
                    {(!d.state || d.state === 'DRAFT') && !d.sentAt && (
                      <Button
                        size="sm"
                        onClick={() => {
                          void sendNewsletterDraft(
                            d.id,
                            d.subscribersOnly ? 'fans' : 'all',
                          ).then((r) => {
                            if (!r.ok) {
                              setMsg(r.error);
                            } else {
                              setMsg(
                                r.queued != null
                                  ? `Queued send to ${r.queued} subscribers.`
                                  : 'Send queued.',
                              );
                              reload();
                            }
                          });
                        }}
                      >
                        <SendIcon size={16} aria-hidden className="mr-1.5" />
                        Send
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </StudioPanel>
        )}

        <Dialog.Root isOpen={postOpen} onClose={closePost}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!postBody.trim() || busy) {
                return;
              }
              setBusy(true);
              void createArtistPost({
                title: postTitle.trim() || undefined,
                body: postBody.trim(),
              }).then((r) => {
                setBusy(false);
                if (!r.ok) {
                  setMsg(r.error);
                  return;
                }
                setMsg('Post published.');
                closePost();
                reload();
              });
            }}
          >
            <Dialog.Title>
              <span className="inline-flex items-center gap-2">
                <NewspaperIcon size={18} aria-hidden />
                New post
              </span>
            </Dialog.Title>
            <div className="mt-4 flex flex-col gap-3">
              <Input
                label="Title (optional)"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                autoFocus
              />
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Body
                </span>
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  rows={4}
                  className="border-border bg-background rounded-md border px-3 py-2"
                  required
                />
              </label>
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button type="submit" disabled={!postBody.trim() || busy}>
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Publishing…' : 'Publish'}
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Root>

        <Dialog.Root isOpen={draftOpen} onClose={closeDraft}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!nlSubject.trim() || !nlBody.trim() || busy) {
                return;
              }
              setBusy(true);
              void createNewsletterDraft({
                subject: nlSubject.trim(),
                bodyMd: nlBody.trim(),
                subscribersOnly: nlFansOnly,
              }).then((r) => {
                setBusy(false);
                if (!r.ok) {
                  setMsg(r.error);
                  return;
                }
                setMsg('Draft saved.');
                closeDraft();
                reload();
              });
            }}
          >
            <Dialog.Title>
              <span className="inline-flex items-center gap-2">
                <SendIcon size={18} aria-hidden />
                New draft
              </span>
            </Dialog.Title>
            <div className="mt-4 flex flex-col gap-3">
              <Input
                label="Subject"
                value={nlSubject}
                onChange={(e) => setNlSubject(e.target.value)}
                autoFocus
              />
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Body (markdown)
                </span>
                <textarea
                  value={nlBody}
                  onChange={(e) => setNlBody(e.target.value)}
                  rows={5}
                  className="border-border bg-background rounded-md border px-3 py-2"
                  required
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={nlFansOnly}
                  onChange={(e) => setNlFansOnly(e.target.checked)}
                />
                Fans / subscribers only
              </label>
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button
                type="submit"
                disabled={!nlSubject.trim() || !nlBody.trim() || busy}
              >
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Saving…' : 'Save draft'}
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Root>
      </div>
    </StudioGate>
  );
}
