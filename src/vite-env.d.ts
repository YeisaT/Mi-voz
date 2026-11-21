/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_WEBHOOK_DECISION: string;
  readonly VITE_N8N_WEBHOOK_PREGUNTAS: string;
  readonly VITE_CODIGO_ACCESO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
