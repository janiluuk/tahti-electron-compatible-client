import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchConversation,
  fetchConversations,
  searchUsers,
  sendDm,
  startConversation,
  type ChatDm,
  type ConversationSummary,
} from '../api/messages';
import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';

export function MessagesView() {
  const user = useAuthStore((s) => s.user);
  const [inbox, setInbox] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatDm[]>([]);
  const [otherName, setOtherName] = useState('');
  const [body, setBody] = useState('');
  const [composeUser, setComposeUser] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const reloadInbox = () => {
    void fetchConversations().then((r) => {
      setInbox(r.data);
    });
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    reloadInbox();
  }, [user]);

  const openThread = (id: string) => {
    setActiveId(id);
    void fetchConversation(id).then((r) => {
      if (!r.data) {
        return;
      }
      setMessages(r.data.messages);
      setOtherName(r.data.otherUser.displayName);
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-foreground-secondary text-sm">
          Sign in to read DMs.
        </p>
        <Button
          size="sm"
          onClick={() => useAuthModalStore.getState().open('login')}
        >
          Log in
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Messages
        </h1>
        <p className="text-foreground-secondary text-xs">
          Direct messages with artists and listeners.
        </p>
      </div>

      <div className="border-border flex flex-wrap gap-2 rounded-lg border p-3">
        <Input
          label="Message @"
          value={composeUser}
          onChange={(e) => setComposeUser(e.target.value)}
          placeholder="username"
        />
        <Button
          size="sm"
          disabled={!composeUser.trim()}
          onClick={() => {
            void startConversation(composeUser.trim()).then((r) => {
              if (!r.ok) {
                setMsg(r.error);
              } else {
                setComposeUser('');
                reloadInbox();
                openThread(r.conversationId);
              }
            });
          }}
        >
          Start
        </Button>
        <Button
          size="sm"
          variant="text"
          onClick={() => {
            void searchUsers(composeUser.trim()).then((r) => {
              if (r.data[0]) {
                setComposeUser(r.data[0].username);
              }
            });
          }}
        >
          Search
        </Button>
      </div>

      {msg && <p className="text-sm">{msg}</p>}

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <ul className="border-border divide-border max-h-96 divide-y overflow-y-auto rounded-lg border">
          {inbox.length === 0 ? (
            <li className="text-foreground-secondary p-3 text-sm">
              No conversations.
            </li>
          ) : (
            inbox.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => openThread(c.id)}
                  className={`w-full px-3 py-2 text-left text-sm ${
                    activeId === c.id ? 'bg-background-secondary' : ''
                  }`}
                >
                  <div className="font-medium">{c.otherUser.displayName}</div>
                  <div className="text-foreground-secondary truncate text-xs">
                    {c.lastMessage?.body ?? 'No messages yet'}
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="border-border flex min-h-72 flex-col rounded-lg border">
          {!activeId ? (
            <p className="text-foreground-secondary p-4 text-sm">
              Select a conversation.
            </p>
          ) : (
            <>
              <div className="border-border border-b px-3 py-2 text-sm font-medium">
                {otherName}
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      m.isMine
                        ? 'bg-primary text-foreground ml-auto'
                        : 'bg-background-secondary'
                    }`}
                  >
                    <div className="text-[10px] opacity-70">
                      {m.senderDisplayName}
                    </div>
                    {m.body}
                  </div>
                ))}
              </div>
              <div className="border-border flex gap-2 border-t p-3">
                <Input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a message…"
                  size="sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!body.trim() || !activeId) {
                        return;
                      }
                      void sendDm(activeId, body.trim()).then((r) => {
                        if (!r.ok) {
                          setMsg(r.error);
                        } else {
                          setBody('');
                          openThread(activeId);
                          reloadInbox();
                        }
                      });
                    }
                  }}
                />
                <Button
                  size="sm"
                  disabled={!body.trim()}
                  onClick={() => {
                    if (!activeId) {
                      return;
                    }
                    void sendDm(activeId, body.trim()).then((r) => {
                      if (!r.ok) {
                        setMsg(r.error);
                      } else {
                        setBody('');
                        openThread(activeId);
                        reloadInbox();
                      }
                    });
                  }}
                >
                  Send
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
