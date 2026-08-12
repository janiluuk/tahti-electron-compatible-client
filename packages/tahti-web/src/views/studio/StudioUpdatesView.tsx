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

type Tab = 'posts' | 'newsletter';

export function StudioUpdatesView() {
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<ArtistPost[]>([]);
  const [drafts, setDrafts] = useState<NewsletterDraft[]>([]);
  const [source, setSource] = useState('…');
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
        setSource(`${p.meta.source}/${n.meta.source}`);
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
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/updates" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Updates
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Artist posts + newsletter drafts. Source: {source}.
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
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
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
                tab === t.id
                  ? 'bg-primary text-foreground'
                  : 'border-border text-foreground-secondary hover:text-foreground border'
              }`}
            >
              <t.icon size={14} aria-hidden />
              {t.label}
            </button>
          ))}
        </nav>

        {msg && <p className="text-sm">{msg}</p>}

        {tab === 'posts' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  setMsg(null);
                  setPostOpen(true);
                }}
              >
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                New post
              </Button>
            </div>
            <ul className="flex flex-col gap-2">
              {posts.length === 0 ? (
                <li className="border-border rounded-lg border px-4 py-8 text-center">
                  <p className="text-foreground-secondary text-sm">
                    No posts yet.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => setPostOpen(true)}
                  >
                    <PlusIcon size={16} aria-hidden className="mr-1.5" />
                    New post
                  </Button>
                </li>
              ) : (
                posts.map((p) => (
                  <li
                    key={p.id}
                    className="border-border rounded-lg border px-3 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">
                          {p.title || 'Untitled'}
                        </div>
                        <p className="text-foreground-secondary mt-1 text-sm whitespace-pre-wrap">
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
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {tab === 'newsletter' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  setMsg(null);
                  setDraftOpen(true);
                }}
              >
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                New draft
              </Button>
            </div>
            <ul className="flex flex-col gap-2">
              {drafts.length === 0 ? (
                <li className="border-border rounded-lg border px-4 py-8 text-center">
                  <p className="text-foreground-secondary text-sm">
                    No drafts yet.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => setDraftOpen(true)}
                  >
                    <PlusIcon size={16} aria-hidden className="mr-1.5" />
                    New draft
                  </Button>
                </li>
              ) : (
                drafts.map((d) => (
                  <li
                    key={d.id}
                    className="border-border rounded-lg border px-3 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
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
                                    : 'Send queued (mock or API).',
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
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
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
