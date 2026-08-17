import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  createNewsPost,
  deleteNewsPost,
  fetchAdminNews,
  updateNewsPost,
  type AdminNewsPost,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function AdminNewsView() {
  const [posts, setPosts] = useState<AdminNewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHeadline, setEditHeadline] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    void fetchAdminNews().then((res) => {
      setPosts(res.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  const closeCompose = () => {
    setComposeOpen(false);
    setHeadline('');
    setSummary('');
    setBusy(false);
  };

  const startEdit = (post: AdminNewsPost) => {
    setEditingId(post.id);
    setEditHeadline(post.headline);
    setEditSummary(post.summary);
  };

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/news" />
        <StudioPageHeader
          title="News"
          subtitle="Posts published to the platform news feed."
          action={
            <Button size="sm" onClick={() => setComposeOpen(true)}>
              <PlusIcon size={16} aria-hidden className="mr-1.5" />
              Write post
            </Button>
          }
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : posts.length === 0 ? (
            <div className="flex flex-col gap-3 py-4 text-center">
              <p className="text-foreground-secondary text-sm">
                No news posts yet.
              </p>
              <div>
                <Button size="sm" onClick={() => setComposeOpen(true)}>
                  <PlusIcon size={16} aria-hidden className="mr-1.5" />
                  Write post
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {posts.map((post) =>
                editingId === post.id ? (
                  <li key={post.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-3">
                      <Input
                        label="Headline"
                        value={editHeadline}
                        onChange={(e) => setEditHeadline(e.target.value)}
                      />
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-foreground-secondary text-xs uppercase">
                          Summary
                        </span>
                        <textarea
                          value={editSummary}
                          onChange={(e) => setEditSummary(e.target.value)}
                          rows={3}
                          className="border-border bg-background rounded-md border px-3 py-2"
                        />
                      </label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() => {
                            setBusy(true);
                            void updateNewsPost(post.id, {
                              headline: editHeadline.trim(),
                              summary: editSummary.trim(),
                            }).then((r) => {
                              setBusy(false);
                              if (!r.ok) {
                                setMsg(r.error);
                                return;
                              }
                              setEditingId(null);
                              reload();
                            });
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="text"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li
                    key={post.id}
                    className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{post.headline}</div>
                      <p className="text-foreground-secondary text-xs">
                        By {post.authorName} ·{' '}
                        {post.publishedAt
                          ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                          : 'Draft'}
                      </p>
                      <p className="mt-1 text-sm">{post.summary}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => startEdit(post)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => {
                          void updateNewsPost(post.id, {
                            publish: !post.publishedAt,
                          }).then((r) => {
                            if (!r.ok) {
                              setMsg(r.error);
                            } else {
                              reload();
                            }
                          });
                        }}
                      >
                        {post.publishedAt ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Delete "${post.headline}"? This can't be undone.`,
                            )
                          ) {
                            return;
                          }
                          void deleteNewsPost(post.id).then((r) => {
                            if (!r.ok) {
                              setMsg(r.error);
                            } else {
                              reload();
                            }
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </StudioPanel>

        <Dialog.Root isOpen={composeOpen} onClose={closeCompose}>
          <Dialog.Title>Write a news post</Dialog.Title>
          <div className="mt-4 flex flex-col gap-3">
            <Input
              label="Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              autoFocus
            />
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground-secondary text-xs uppercase">
                Short summary
              </span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="border-border bg-background rounded-md border px-3 py-2"
              />
            </label>
          </div>
          <Dialog.Actions>
            <Dialog.Close>Cancel</Dialog.Close>
            <Button
              variant="secondary"
              disabled={busy || !headline.trim() || !summary.trim()}
              onClick={() => {
                setBusy(true);
                void createNewsPost({
                  headline: headline.trim(),
                  summary: summary.trim(),
                  publish: false,
                }).then((r) => {
                  setBusy(false);
                  if (!r.ok) {
                    setMsg(r.error);
                    return;
                  }
                  closeCompose();
                  reload();
                });
              }}
            >
              Save as draft
            </Button>
            <Button
              disabled={busy || !headline.trim() || !summary.trim()}
              onClick={() => {
                setBusy(true);
                void createNewsPost({
                  headline: headline.trim(),
                  summary: summary.trim(),
                  publish: true,
                }).then((r) => {
                  setBusy(false);
                  if (!r.ok) {
                    setMsg(r.error);
                    return;
                  }
                  closeCompose();
                  reload();
                });
              }}
            >
              {busy ? 'Publishing…' : 'Publish'}
            </Button>
          </Dialog.Actions>
        </Dialog.Root>
      </div>
    </AdminGate>
  );
}
