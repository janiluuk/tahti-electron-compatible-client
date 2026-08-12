/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAHTI_API_URL?: string;
  readonly VITE_TAHTI_API_PROXY_TARGET?: string;
  readonly VITE_FORCE_MOCK?: string;
  readonly VITE_CENTRIFUGO_WS?: string;
  readonly VITE_HCAPTCHA_SITEKEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
