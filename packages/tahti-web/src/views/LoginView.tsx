import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { useAuthStore } from '../stores/authStore';

export function LoginView() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const completeTotp = useAuthStore((s) => s.completeTotp);
  const cancelTotp = useAuthStore((s) => s.cancelTotp);
  const totpChallengeId = useAuthStore((s) => s.totpChallengeId);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');

  if (user) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Logged in
        </h1>
        <p className="text-sm">
          {user.displayName} (@{user.username})
        </p>
        <p className="text-foreground-secondary text-xs">{user.email}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void logout()}>
            Log out
          </Button>
          <Link
            to="/"
            className="text-foreground-secondary self-center text-sm underline"
          >
            Listen
          </Link>
        </div>
      </div>
    );
  }

  if (totpChallengeId) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <Link
          to="/more"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Tahti map
        </Link>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Two-factor code
        </h1>
        <p className="text-foreground-secondary text-sm">
          Enter the 6-digit code from your authenticator app (or a backup code).
          Mock demo accepts <code>000000</code> or <code>123456</code> when
          using email with <code>+totp</code> or password <code>totp-demo</code>
          .
        </p>
        <Input
          label="Authentication code"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value.trim())}
          autoComplete="one-time-code"
          inputMode="numeric"
        />
        {error && <p className="text-accent-red text-sm">{error}</p>}
        <Button
          disabled={loading || totpCode.length < 6}
          onClick={() => {
            void completeTotp(totpCode)
              .then(() => navigate({ to: '/' }))
              .catch(() => undefined);
          }}
        >
          {loading ? 'Verifying…' : 'Verify and sign in'}
        </Button>
        <Button variant="text" size="sm" onClick={() => cancelTotp()}>
          Back to password
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Link
        to="/more"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Tahti map
      </Link>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Login
      </h1>
      <p className="text-foreground-secondary text-sm">
        Session cookie via <code>POST /api/auth/login</code> (credentials
        included). Mock mode accepts any email/password; use <code>+totp</code>{' '}
        in the email or password <code>totp-demo</code> to exercise 2FA.
      </p>
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
      {error && <p className="text-accent-red text-sm">{error}</p>}
      <Button
        disabled={loading || !email || !password}
        onClick={() => {
          void login(email, password)
            .then((r) => {
              if (r.requiresTotp) {
                return;
              }
              void navigate({ to: '/' });
            })
            .catch(() => undefined);
        }}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-foreground-secondary text-sm">
        No account?{' '}
        <Link to="/join" className="underline-offset-2 hover:underline">
          Join
        </Link>
      </p>
    </div>
  );
}
