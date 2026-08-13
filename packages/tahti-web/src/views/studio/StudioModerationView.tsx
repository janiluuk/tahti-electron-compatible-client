import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  addModerator,
  banChatFingerprint,
  fetchChatBans,
  fetchModerators,
  removeModerator,
  unbanChatFingerprint,
  type ChatBan,
  type ModeratorRow,
} from '../../api/artist-settings';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { useAuthStore } from '../../stores/authStore';

export function StudioModerationView() {
  const user = useAuthStore((s) => s.user);
  const slug = user?.channel?.slug ?? '';

  const [mods, setMods] = useState<ModeratorRow[]>([]);
  const [bans, setBans] = useState<ChatBan[]>([]);
  const [newModUsername, setNewModUsername] = useState('');
  const [newBanHash, setNewBanHash] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    void Promise.all([fetchModerators(), fetchChatBans(slug)]).then(
      ([m, b]) => {
        setMods(m.data);
        setBans(b.data);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    reload();
  }, [slug]);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/moderation" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Moderation
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Delegate chat moderation to trusted listeners, and manage chat bans
            for your channel.
          </p>
        </div>

        {msg && <p className="text-sm">{msg}</p>}

        <section className="border-border flex flex-col gap-4 rounded-xl border p-4">
          <h2 className="font-display text-lg font-bold">
            Delegated moderators
          </h2>
          <p className="text-foreground-secondary text-sm">
            Moderators can ban and unban listeners from your chat on your
            behalf.
          </p>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : mods.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No moderators yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {mods.map((m) => (
                <li
                  key={m.id}
                  className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <span>
                    {m.displayName} (@{m.username})
                  </span>
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => {
                      void removeModerator(m.id).then((r) => {
                        if (!r.ok) {
                          setMsg(r.error);
                        } else {
                          reload();
                        }
                      });
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label="Username"
              value={newModUsername}
              onChange={(e) => setNewModUsername(e.target.value)}
              placeholder="listener-handle"
            />
            <Button
              size="sm"
              disabled={!newModUsername.trim()}
              onClick={() => {
                void addModerator(newModUsername.trim()).then((r) => {
                  if (!r.ok) {
                    setMsg(r.error);
                  } else {
                    setNewModUsername('');
                    setMsg(`Added ${r.data.displayName} as moderator.`);
                    reload();
                  }
                });
              }}
            >
              Add moderator
            </Button>
          </div>
        </section>

        <section className="border-border flex flex-col gap-4 rounded-xl border p-4">
          <h2 className="font-display text-lg font-bold">Chat bans</h2>
          <p className="text-foreground-secondary text-sm">
            Bans are keyed by a listener's chat fingerprint, not their account —
            banning stops one device/session from posting.
          </p>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : bans.length === 0 ? (
            <p className="text-foreground-secondary text-sm">No active bans.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {bans.map((b) => (
                <li
                  key={b.fingerprintHash}
                  className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-mono text-xs">{b.fingerprintHash}</div>
                    <div className="text-foreground-secondary text-xs">
                      Banned {new Date(b.bannedAt).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => {
                      void unbanChatFingerprint(slug, b.fingerprintHash).then(
                        (r) => {
                          if (!r.ok) {
                            setMsg(r.error);
                          } else {
                            reload();
                          }
                        },
                      );
                    }}
                  >
                    Unban
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label="Fingerprint hash"
              value={newBanHash}
              onChange={(e) => setNewBanHash(e.target.value)}
              placeholder="from a chat message's report action"
            />
            <Button
              size="sm"
              disabled={!newBanHash.trim()}
              onClick={() => {
                void banChatFingerprint(slug, newBanHash.trim()).then((r) => {
                  if (!r.ok) {
                    setMsg(r.error);
                  } else {
                    setNewBanHash('');
                    reload();
                  }
                });
              }}
            >
              Ban
            </Button>
          </div>
        </section>
      </div>
    </StudioGate>
  );
}
