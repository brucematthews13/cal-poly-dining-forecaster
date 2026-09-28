/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the API, e.g. https://your-api.onrender.com/api. Defaults to the relative '/api' (used by the Vite dev proxy). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
