import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Badge, Button } from '@nuclearplayer/ui';

import {
  fetchGovernanceMotions,
  fetchMotionComments,
  postMotionComment,
  voteOnMotion,
  type FetchMeta,
  type MotionComment,
} from '../api/client';
import type { GovernanceMotion } from '../api/types';
import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';

function stateBadge(state: string): {
  color: 'green' | 'orange' | 'secondary';
  label: string;
} {
  if (state === 'OPEN') {
    return { color: 'green', label: 'Open' };
  }
  if (state === 'CLOSED') {
    return { color: 'secondary', label: 'Closed' };
  }
  return { color: 'orange', label: state };
}

export function GovernanceView() {
  const user = useAuthStore((s) => s.user);
  const [motions, setMotions] = useState<GovernanceMotion[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<MotionComment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  const reload = () => {
    if (!user) {
      return;
    }
    void fetchGovernanceMotions().then((res) => {
      setMotions(res.data);
      setMeta(res.meta);
      setForbidden(Boolean(res.forbidden) && res.data.length === 0);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setMotions([]);
      setForbidden(true);
      return;
    }
    setLoading(true);
    reload();
  }, [user]);

  const openThread = (id: string) => {
    setExpandedId(id);
    setCommentBody('');
    void fetchMotionComments(id).then((res) => setComments(res.data));
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        to="/more"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Tahti map
      </Link>
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Governance
        </h1>
        <p className="text-foreground-secondary mt-1 text-sm">
          Cooperative motions — vote YES / NO / ABSTAIN and join the discussion.
        </p>
        {meta && (
          <p className="text-foreground-secondary mt-2 text-xs">
            Source: {meta.source}
            {meta.reason ? ` (${meta.reason})` : ''}
          </p>
        )}
      </div>

      {!user && (
        <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
          <p className="text-sm">
            Sign in with a cooperative membership account to vote.
          </p>
          <Button
            size="sm"
            onClick={() => useAuthModalStore.getState().open('login')}
          >
            Log in
          </Button>
        </div>
      )}

      {user && loading && (
        <p className="text-foreground-secondary text-sm">Loading motions…</p>
      )}

      {user && !loading && forbidden && (
        <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
          <p className="text-sm">
            Motions are gated to active Tahti ry members. Signed in as @
            {user.username}.
          </p>
          <a
            href="https://tahti.live/governance"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" variant="secondary">
              Open production governance
            </Button>
          </a>
        </div>
      )}

      {user && !loading && !forbidden && motions.length === 0 && (
        <p className="text-foreground-secondary text-sm">
          No motions returned.
        </p>
      )}

      {actionMsg && (
        <p className="border-border bg-background-secondary rounded-lg border px-3 py-2 text-sm">
          {actionMsg}
        </p>
      )}

      {user && motions.length > 0 && (
        <ul className="flex flex-col gap-3">
          {motions.map((m) => {
            const badge = stateBadge(m.state);
            return (
              <li key={m.id} className="border-border rounded-lg border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-lg font-bold">{m.title}</h2>
                  <Badge variant="pill" color={badge.color}>
                    {badge.label}
                  </Badge>
                </div>
                <p className="text-foreground-secondary mt-1 text-xs">
                  {m.proposer ? `Proposed by ${m.proposer}` : 'Motion'}
                  {typeof m.totalVotes === 'number'
                    ? `, ${m.totalVotes} votes`
                    : ''}
                  {typeof m.commentCount === 'number'
                    ? `, ${m.commentCount} comments`
                    : ''}
                </p>
                {m.youVoted && (
                  <p className="mt-2 text-sm">
                    Your vote:{' '}
                    <Badge variant="pill" color="cyan">
                      {m.yourChoice ?? 'recorded'}
                    </Badge>
                  </p>
                )}
                {m.tally && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="border-border rounded border px-2 py-1">
                      YES {m.tally.YES}
                    </span>
                    <span className="border-border rounded border px-2 py-1">
                      NO {m.tally.NO}
                    </span>
                    <span className="border-border rounded border px-2 py-1">
                      ABSTAIN {m.tally.ABSTAIN}
                    </span>
                  </div>
                )}

                {m.state === 'OPEN' && !m.youVoted && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['YES', 'NO', 'ABSTAIN'] as const).map((choice) => (
                      <Button
                        key={choice}
                        size="sm"
                        variant={choice === 'YES' ? 'default' : 'secondary'}
                        disabled={votingId === m.id}
                        onClick={() => {
                          setVotingId(m.id);
                          void voteOnMotion(m.id, choice).then((r) => {
                            setVotingId(null);
                            setActionMsg(r.ok ? `Voted ${choice}.` : r.error);
                            if (r.ok) {
                              reload();
                            }
                          });
                        }}
                      >
                        {choice}
                      </Button>
                    ))}
                  </div>
                )}

                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => {
                      if (expandedId === m.id) {
                        setExpandedId(null);
                      } else {
                        openThread(m.id);
                      }
                    }}
                  >
                    {expandedId === m.id ? 'Hide discussion' : 'Discussion'}
                  </Button>
                </div>

                {expandedId === m.id && (
                  <div className="border-border mt-3 flex flex-col gap-2 border-t pt-3">
                    {comments.length === 0 ? (
                      <p className="text-foreground-secondary text-xs">
                        No comments yet.
                      </p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {comments.map((c) => (
                          <li
                            key={c.id}
                            className="border-border rounded-md border px-3 py-2"
                          >
                            <div className="text-foreground-secondary text-xs">
                              {c.authorDisplayName ?? 'Member'}
                              {c.createdAt
                                ? `, ${new Date(c.createdAt).toLocaleString()}`
                                : ''}
                            </div>
                            <p className="mt-1">{c.body}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                    {m.state !== 'CLOSED' && (
                      <div className="flex flex-wrap gap-2">
                        <input
                          value={commentBody}
                          onChange={(e) => setCommentBody(e.target.value)}
                          placeholder="Add a comment…"
                          className="border-border bg-background focus:border-primary min-w-[200px] flex-1 rounded-md border px-3 py-2 text-sm outline-none"
                        />
                        <Button
                          size="sm"
                          disabled={!commentBody.trim()}
                          onClick={() => {
                            void postMotionComment(
                              m.id,
                              commentBody.trim(),
                            ).then((r) => {
                              if (!r.ok) {
                                setActionMsg(r.error);
                                return;
                              }
                              setComments((prev) => [...prev, r.data]);
                              setCommentBody('');
                              setActionMsg('Comment posted.');
                              reload();
                            });
                          }}
                        >
                          Post
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
