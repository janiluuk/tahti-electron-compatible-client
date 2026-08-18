import { useEffect, useRef, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchChatAccess,
  fetchChatHistory,
  requestChatToken,
  requestChatViewerToken,
} from '../api/client';
import { postChatReaction } from '../api/studio-extras';
import type { ChatMessage } from '../api/types';
import { useHcaptcha } from '../lib/useHcaptcha';
import { useAuthStore } from '../stores/authStore';
import { Eyebrow } from './tahti/Eyebrow';

// Must match the backend's CHAT_REACTION_EMOJIS whitelist exactly
// (packages/shared/src/dto/chat.ts in the main tahti repo) -- anything
// outside this set gets rejected server-side with "Invalid emoji".
const REACTION_EMOJIS = ['💜', '🔥', '🎶', '🎵', '🌟', '👏', '✨'] as const;

const HANDLE_KEY = 'tahti-web-chat-handle';
const forceMock = () => import.meta.env.VITE_FORCE_MOCK === '1';

type LiveMode = 'live' | 'rest' | 'mock';

function centrifugoWsUrl(): string | null {
  const fromEnv = import.meta.env.VITE_CENTRIFUGO_WS;
  if (fromEnv) {
    return fromEnv;
  }
  // Dev: local Centrifugo. Prod/beta builds: public chat host.
  if (import.meta.env.DEV) {
    return 'ws://localhost:8000/connection/websocket';
  }
  return 'wss://chat.tahti.live/connection/websocket';
}

type Props = {
  slug: string;
  compact?: boolean;
  /** Fill the right sidebar height (no max-height cap). */
  rail?: boolean;
};

export function ChannelChatPanel({ slug, compact, rail }: Props) {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [accessNote, setAccessNote] = useState<string | null>(null);
  const [handle, setHandle] = useState('');
  const [pendingHandle, setPendingHandle] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [mode, setMode] = useState<LiveMode>('rest');
  const [wsStatus, setWsStatus] = useState<'off' | 'connecting' | 'connected'>(
    'off',
  );
  const [publishToken, setPublishToken] = useState<string | null>(null);
  const [supporter, setSupporter] = useState(false);
  const [channelRole, setChannelRole] = useState<'owner' | 'moderator' | null>(
    null,
  );
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [floatingReact, setFloatingReact] = useState<string | null>(null);
  const [reactBusy, setReactBusy] = useState(false);

  // Anonymous join needs hCaptcha when site key is set (signed-in skips captcha server-side).
  const captchaNeeded = !user && !forceMock();
  const {
    captchaRef,
    configured: captchaConfigured,
    getToken,
    reset: resetCaptcha,
  } = useHcaptcha(captchaNeeded);

  const wsRef = useRef<WebSocket | null>(null);
  const msgIdRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef({
    supporter: false,
    channelRole: null as typeof channelRole,
    countryCode: null as string | null,
  });

  badgesRef.current = { supporter, channelRole, countryCode };

  useEffect(() => {
    const saved = localStorage.getItem(HANDLE_KEY);
    if (saved) {
      setPendingHandle(saved);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchChatHistory(slug), fetchChatAccess(slug)]).then(
      ([hist, access]) => {
        if (cancelled) {
          return;
        }
        setMessages(hist.data);
        // Only force mock send mode for offline demo — API-down fallback
        // must not block Centrifugo when a real token is available.
        if (forceMock()) {
          setMode('mock');
        } else {
          setMode('rest');
        }
        if (access.data.subscribersOnly && !access.data.canPostInChat) {
          setAccessNote(
            'Subscribers-only chat — you can read; posting needs a fan sub + login.',
          );
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    void requestChatViewerToken(slug).then((token) => {
      if (cancelled || !token || mode === 'mock') {
        return;
      }
      connectWs(token, false);
    });
    return () => {
      cancelled = true;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [slug, mode]);

  function connectWs(token: string, canPublish: boolean) {
    const url = centrifugoWsUrl();
    if (!url) {
      return;
    }
    try {
      wsRef.current?.close();
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setWsStatus('connecting');
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: msgIdRef.current++, connect: { token } }));
      };
      ws.onmessage = (ev) => {
        for (const line of String(ev.data).split('\n')) {
          if (!line.trim()) {
            continue;
          }
          try {
            const data = JSON.parse(line) as {
              connect?: { client: string };
              push?: {
                pub?: {
                  data: {
                    handle?: string;
                    text?: string;
                    ts?: number;
                    supporter?: boolean;
                    channelRole?: 'owner' | 'moderator' | null;
                    countryCode?: string | null;
                    system?: boolean;
                  };
                };
              };
            };
            if (data.connect) {
              ws.send(
                JSON.stringify({
                  id: msgIdRef.current++,
                  subscribe: { channel: `channel:${slug}` },
                }),
              );
              setWsStatus('connected');
              if (canPublish) {
                setMode('live');
              }
            }
            if (data.push?.pub?.data?.text) {
              const msg = data.push.pub.data;
              setMessages((prev) =>
                [
                  ...prev,
                  {
                    id: `${Date.now()}-${Math.random()}`,
                    handle: msg.handle ?? 'anon',
                    text: msg.text!,
                    ts: msg.ts ?? Date.now(),
                    supporter: msg.supporter,
                    channelRole: msg.channelRole ?? null,
                    countryCode: msg.countryCode ?? null,
                    system: msg.system,
                  },
                ].slice(-100),
              );
            }
          } catch {
            // ignore malformed
          }
        }
      };
      ws.onerror = () => {
        setWsStatus('off');
        if (!canPublish) {
          setMode((m) => (m === 'live' ? 'rest' : m));
        }
      };
      ws.onclose = () => {
        setWsStatus('off');
        if (canPublish) {
          setMode((m) => (m === 'live' ? 'rest' : m));
        }
      };
    } catch {
      setWsStatus('off');
    }
  }

  async function join() {
    const h = pendingHandle.trim().slice(0, 32);
    if (!h) {
      setError('Pick a handle to join.');
      return;
    }
    const hcaptchaToken =
      captchaNeeded && captchaConfigured ? getToken() : undefined;
    if (captchaNeeded && captchaConfigured && !hcaptchaToken) {
      setError('Complete hCaptcha before joining.');
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const { data, meta: joinMeta } = await requestChatToken(
        slug,
        h,
        hcaptchaToken,
      );
      localStorage.setItem(HANDLE_KEY, data.handle);
      setHandle(data.handle);
      setPublishToken(data.token);
      setSupporter(Boolean(data.supporter));
      setChannelRole(data.channelRole ?? null);
      setCountryCode(data.countryCode ?? null);
      resetCaptcha();
      if (joinMeta.source === 'mock') {
        setMode('mock');
      } else if (data.token && data.token !== 'mock-token') {
        connectWs(data.token, true);
        setMode('rest');
      } else {
        setMode('mock');
      }
    } catch (err) {
      // Captcha / API down → still allow mock posting with clear status
      localStorage.setItem(HANDLE_KEY, h);
      setHandle(h);
      setPublishToken('mock-local');
      setMode('mock');
      resetCaptcha();
      setError(
        err instanceof Error
          ? `${err.message} — using local mock send`
          : 'Join failed — using local mock send',
      );
    } finally {
      setJoining(false);
    }
  }

  function send() {
    const text = input.trim().slice(0, 500);
    if (!handle || !text) {
      return;
    }

    if (
      mode === 'live' &&
      publishToken &&
      wsRef.current &&
      wsStatus === 'connected'
    ) {
      const badges = badgesRef.current;
      wsRef.current.send(
        JSON.stringify({
          id: msgIdRef.current++,
          publish: {
            channel: `channel:${slug}`,
            data: {
              handle,
              text,
              ts: Date.now(),
              supporter: badges.supporter || undefined,
              channelRole: badges.channelRole || undefined,
              countryCode: badges.countryCode || undefined,
            },
          },
        }),
      );
      setInput('');
      return;
    }

    // REST history has no client publish; mock/local append with status badge
    setMessages((prev) =>
      [
        ...prev,
        {
          id: `local-${Date.now()}`,
          handle,
          text,
          ts: Date.now(),
          system: false,
        },
      ].slice(-100),
    );
    setInput('');
    if (mode !== 'mock') {
      setMode('mock');
    }
  }

  const isLive = mode === 'live' && wsStatus === 'connected';

  return (
    <div
      className={`border-border bg-background flex flex-col rounded-lg border ${
        rail ? 'h-full min-h-0 flex-1' : compact ? 'max-h-80' : 'max-h-[28rem]'
      }`}
    >
      <div className="border-border flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="font-display text-sm font-bold">Chat</div>
        {isLive && (
          <div className="text-foreground-secondary flex items-center gap-1.5 font-mono text-[10px] tracking-wide uppercase">
            <span
              className="bg-accent-green size-1.5 rounded-full"
              aria-hidden
            />
            Live
          </div>
        )}
      </div>

      <div className="border-border flex flex-wrap items-center gap-1 border-b px-3 py-2">
        <Eyebrow className="mr-1">React</Eyebrow>
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            disabled={reactBusy}
            className="hover:bg-background-secondary rounded px-1.5 py-0.5 text-sm"
            onClick={() => {
              setReactBusy(true);
              void postChatReaction(slug, emoji).then((r) => {
                setReactBusy(false);
                if (r.ok) {
                  setFloatingReact(emoji);
                  window.setTimeout(() => setFloatingReact(null), 1200);
                } else {
                  setError(r.error);
                }
              });
            }}
          >
            {emoji}
          </button>
        ))}
        {floatingReact && (
          <span className="text-foreground-secondary text-xs">
            Sent {floatingReact}
          </span>
        )}
      </div>

      {(error || accessNote) && (
        <div className="text-foreground-secondary border-border border-b px-3 py-2 text-xs">
          {error ?? accessNote}
        </div>
      )}

      <div
        ref={scrollRef}
        className={`space-y-2 overflow-y-auto px-3 py-2 text-sm ${rail ? 'min-h-0 flex-1' : 'flex-1'}`}
      >
        {messages.length === 0 && (
          <p className="text-foreground-secondary text-xs">
            No messages yet — say hi.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="leading-snug">
            <span
              className={
                m.channelRole === 'owner'
                  ? 'text-primary font-semibold'
                  : m.supporter
                    ? 'text-foreground font-semibold'
                    : 'text-foreground-secondary font-medium'
              }
            >
              {m.handle}
            </span>
            <span className="text-foreground"> {m.text}</span>
          </div>
        ))}
      </div>

      {!handle ? (
        <div className="border-border flex flex-col gap-2 border-t p-3">
          <Input
            label="Handle"
            value={pendingHandle}
            onChange={(e) => setPendingHandle(e.target.value)}
            placeholder="anonymous nick"
            size="sm"
          />
          {captchaNeeded && captchaConfigured && (
            <div ref={captchaRef} className="min-h-[78px]" />
          )}
          {user && (
            <p className="text-foreground-secondary text-[10px]">
              Signed in as @{user.username} — captcha not required.
            </p>
          )}
          <Button size="sm" disabled={joining} onClick={() => void join()}>
            {joining ? 'Joining…' : 'Join chat'}
          </Button>
        </div>
      ) : (
        <div className="border-border flex gap-2 border-t p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message as ${handle}`}
            size="sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button size="sm" onClick={send} disabled={!input.trim()}>
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
