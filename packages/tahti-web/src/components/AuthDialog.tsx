import { KeyRoundIcon, LogInIcon, UserPlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';

/** Login / join / TOTP — Nuclear Dialog pattern (not full-page routes). */
export function AuthDialog() {
  const isOpen = useAuthModalStore((s) => s.isOpen);
  const mode = useAuthModalStore((s) => s.mode);
  const close = useAuthModalStore((s) => s.close);
  const setMode = useAuthModalStore((s) => s.setMode);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const verify = useAuthStore((s) => s.verify);
  const completeTotp = useAuthStore((s) => s.completeTotp);
  const cancelTotp = useAuthStore((s) => s.cancelTotp);
  const totpChallengeId = useAuthStore((s) => s.totpChallengeId);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const user = useAuthStore((s) => s.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    clearError();
    setMessage(null);
    setTotpCode('');
  }, [isOpen, mode, clearError]);

  useEffect(() => {
    if (user && isOpen && !totpChallengeId) {
      close();
    }
  }, [user, isOpen, totpChallengeId, close]);

  const handleClose = () => {
    cancelTotp();
    close();
  };

  const titleIcon = totpChallengeId ? (
    <KeyRoundIcon size={18} aria-hidden />
  ) : mode === 'join' ? (
    <UserPlusIcon size={18} aria-hidden />
  ) : (
    <LogInIcon size={18} aria-hidden />
  );

  const title = totpChallengeId
    ? 'Two-factor code'
    : mode === 'join'
      ? 'Join'
      : 'Log in';

  return (
    <Dialog.Root isOpen={isOpen} onClose={handleClose}>
      <Dialog.Title>
        <span className="inline-flex items-center gap-2">
          {titleIcon}
          {title}
        </span>
      </Dialog.Title>
      <Dialog.Description>
        {totpChallengeId
          ? 'Enter the 6-digit code from your authenticator app.'
          : mode === 'join'
            ? 'Create an account, then verify your email.'
            : 'Sign in to unlock your library, studio, and chat.'}
      </Dialog.Description>

      {totpChallengeId ? (
        <div className="mt-4 flex flex-col gap-3">
          <Input
            label="Authentication code"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.trim())}
            autoComplete="one-time-code"
            inputMode="numeric"
          />
          {error ? <p className="text-accent-red text-sm">{error}</p> : null}
          <Dialog.Actions>
            <Button variant="text" size="sm" onClick={() => cancelTotp()}>
              Back
            </Button>
            <Button
              disabled={loading || totpCode.length < 6}
              onClick={() => {
                void completeTotp(totpCode)
                  .then(() => close())
                  .catch(() => undefined);
              }}
            >
              {loading ? 'Verifying…' : 'Verify'}
            </Button>
          </Dialog.Actions>
        </div>
      ) : mode === 'login' ? (
        <div className="mt-4 flex flex-col gap-3">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Password"
            variant="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error ? <p className="text-accent-red text-sm">{error}</p> : null}
          <Dialog.Actions>
            <Button variant="text" size="sm" onClick={() => setMode('join')}>
              Join
            </Button>
            <Button
              disabled={loading || !email || !password}
              onClick={() => {
                void login(email, password)
                  .then((r) => {
                    if (!r.requiresTotp) {
                      close();
                    }
                  })
                  .catch(() => undefined);
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Dialog.Actions>
        </div>
      ) : (
        <div className="mt-4 flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            description="lowercase letters, numbers, - and _"
          />
          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            label="Password"
            variant="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            description="Min 8 characters"
          />
          <Input
            label="Verification token (optional)"
            value={verifyToken}
            onChange={(e) => setVerifyToken(e.target.value)}
            description="Paste from email if you already have one"
          />
          {error ? <p className="text-accent-red text-sm">{error}</p> : null}
          {message ? (
            <p className="text-foreground-secondary text-sm">{message}</p>
          ) : null}
          <Dialog.Actions>
            <Button variant="text" size="sm" onClick={() => setMode('login')}>
              Log in
            </Button>
            {verifyToken.trim() ? (
              <Button
                variant="secondary"
                disabled={loading}
                onClick={() => {
                  clearError();
                  void verify(verifyToken.trim())
                    .then((msg) => {
                      setMessage(msg);
                      setMode('login');
                    })
                    .catch(() => undefined);
                }}
              >
                Verify
              </Button>
            ) : null}
            <Button
              disabled={
                loading || !email || !password || !username || !displayName
              }
              onClick={() => {
                clearError();
                void register({ email, password, username, displayName })
                  .then((msg) => {
                    setMessage(msg);
                    if (import.meta.env.VITE_FORCE_MOCK === '1') {
                      setMode('login');
                    }
                  })
                  .catch(() => undefined);
              }}
            >
              {loading ? 'Creating…' : 'Create account'}
            </Button>
          </Dialog.Actions>
        </div>
      )}
    </Dialog.Root>
  );
}
