import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { useAuthStore } from '../stores/authStore';

function tokenFromUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return new URLSearchParams(window.location.search).get('token') ?? '';
}

export function JoinView() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const verify = useAuthStore((s) => s.verify);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState(tokenFromUrl);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <Link
        to="/more"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Tahti map
      </Link>
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Join
        </h1>
        <p className="text-foreground-secondary mt-1 text-sm">
          <code>POST /api/auth/register</code> then email verify. Production may
          require hCaptcha; mock mode skips captcha and email.
        </p>
      </div>

      <div className="flex flex-col gap-3">
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
        {error && <p className="text-accent-red text-sm">{error}</p>}
        {message && (
          <p className="text-foreground-secondary text-sm">{message}</p>
        )}
        <Button
          disabled={loading || !email || !password || !username || !displayName}
          onClick={() => {
            clearError();
            void register({ email, password, username, displayName })
              .then((msg) => {
                setMessage(msg);
                if (import.meta.env.VITE_FORCE_MOCK === '1') {
                  void navigate({ to: '/login' });
                }
              })
              .catch(() => undefined);
          }}
        >
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </div>

      <div className="border-border flex flex-col gap-3 border-t pt-4">
        <h2 className="font-display text-lg font-bold">Verify email</h2>
        <Input
          label="Verification token"
          value={verifyToken}
          onChange={(e) => setVerifyToken(e.target.value)}
          description="From the email link query (?token=…)"
        />
        <Button
          variant="secondary"
          disabled={loading || !verifyToken.trim()}
          onClick={() => {
            clearError();
            void verify(verifyToken.trim())
              .then((msg) => setMessage(msg))
              .catch(() => undefined);
          }}
        >
          Verify
        </Button>
        <p className="text-foreground-secondary text-sm">
          Already verified?{' '}
          <Link to="/login" className="underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
