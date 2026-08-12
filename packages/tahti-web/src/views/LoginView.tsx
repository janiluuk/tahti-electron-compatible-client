import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useAuthModalStore } from '../stores/authModalStore';

/** Deep link `/login` → Nuclear-style auth dialog on Listen. */
export function LoginView() {
  const navigate = useNavigate();
  const open = useAuthModalStore((s) => s.open);

  useEffect(() => {
    open('login');
    void navigate({ to: '/', replace: true });
  }, [navigate, open]);

  return null;
}
