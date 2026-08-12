import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useAuthModalStore } from '../stores/authModalStore';

/** Deep link `/join` → Nuclear-style join dialog on Listen. */
export function JoinView() {
  const navigate = useNavigate();
  const open = useAuthModalStore((s) => s.open);

  useEffect(() => {
    open('join');
    void navigate({ to: '/', replace: true });
  }, [navigate, open]);

  return null;
}
