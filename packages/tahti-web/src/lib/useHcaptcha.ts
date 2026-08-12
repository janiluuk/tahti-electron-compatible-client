import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    hcaptcha?: {
      render(
        container: string | HTMLElement,
        params: Record<string, string>,
      ): string;
      getResponse(widgetId?: string): string;
      reset(widgetId?: string): void;
    };
    onHcaptchaLoad?: () => void;
  }
}

const SITE_KEY = () => import.meta.env.VITE_HCAPTCHA_SITEKEY ?? '';

/** Load/render hCaptcha when a site key is configured. */
export function useHcaptcha(enabled: boolean) {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const siteKey = SITE_KEY();
  const configured = Boolean(siteKey);

  useEffect(() => {
    if (!enabled || !configured) {
      return;
    }

    const render = () => {
      if (!captchaRef.current || !window.hcaptcha) {
        return;
      }
      if (widgetIdRef.current != null) {
        return;
      }
      widgetIdRef.current = window.hcaptcha.render(captchaRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        size: 'compact',
      });
    };

    if (window.hcaptcha) {
      render();
      return;
    }

    window.onHcaptchaLoad = render;
    const existing = document.querySelector('script[data-tahti-hcaptcha]');
    if (existing) {
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://js.hcaptcha.com/1/api.js?onload=onHcaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.tahtiHcaptcha = '1';
    document.head.appendChild(script);
  }, [enabled, configured, siteKey]);

  function getToken(): string | undefined {
    if (!configured || !window.hcaptcha) {
      return undefined;
    }
    const token = window.hcaptcha.getResponse(widgetIdRef.current);
    return token || undefined;
  }

  function reset() {
    window.hcaptcha?.reset(widgetIdRef.current);
  }

  return { captchaRef, configured, getToken, reset };
}
