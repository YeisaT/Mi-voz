/**
 * Llamadas a n8n con timeout 8s, reintentos y cola en memoria.
 * NUNCA incluir nombres de personaje/mascota en el body.
 */

const TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

type DecisionBody = {
  codigo_acceso: string;
  escenario: 1 | 2 | 3;
  opcion: 'A' | 'B' | 'C';
  puntos: number;
};

type PreguntasBody = {
  codigo_acceso: string;
  escena: string;
  bloque: 'familia' | 'confianza' | 'miedo' | 'bienestar';
  payload: Record<string, unknown>;
};

type QueuedCall =
  | { kind: 'decision'; body: DecisionBody }
  | { kind: 'preguntas'; body: PreguntasBody };

const queue: QueuedCall[] = [];
let flushing = false;

function urlDecision(): string {
  return import.meta.env.VITE_N8N_WEBHOOK_DECISION || '';
}

function urlPreguntas(): string {
  return import.meta.env.VITE_N8N_WEBHOOK_PREGUNTAS || '';
}

async function fetchWithTimeout(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

async function postWithRetry(
  url: string,
  body: unknown,
): Promise<{ ok: boolean; data?: Record<string, unknown> }> {
  if (!url) {
    return { ok: false };
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, body);
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      let data: Record<string, unknown> = {};
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch {
        data = { ok: true };
      }
      return { ok: true, data };
    } catch (err) {
      lastError = err;
    }
  }

  void lastError;
  return { ok: false };
}

async function flushQueue(): Promise<void> {
  if (flushing || queue.length === 0) return;
  flushing = true;
  try {
    while (queue.length > 0) {
      const item = queue[0];
      const url = item.kind === 'decision' ? urlDecision() : urlPreguntas();
      const result = await postWithRetry(url, item.body);
      if (!result.ok) break;
      queue.shift();
    }
  } finally {
    flushing = false;
  }
}

export type DecisionResult = {
  ok: boolean;
  feedback_extra?: string;
};

/** Envía decisión puntuada. Si falla, encola y el juego sigue. */
export async function enviarDecision(
  body: DecisionBody,
): Promise<DecisionResult> {
  const result = await postWithRetry(urlDecision(), body);
  if (!result.ok) {
    queue.push({ kind: 'decision', body });
    void flushQueue();
    return { ok: false };
  }
  void flushQueue();
  const extra = result.data?.feedback_extra;
  return {
    ok: true,
    feedback_extra: typeof extra === 'string' ? extra : undefined,
  };
}

/** Envía respuestas de bloques de Casa. Si falla, encola y el juego sigue. */
export async function enviarPreguntas(body: PreguntasBody): Promise<boolean> {
  const result = await postWithRetry(urlPreguntas(), body);
  if (!result.ok) {
    queue.push({ kind: 'preguntas', body });
    void flushQueue();
    return false;
  }
  void flushQueue();
  return true;
}

export function getQueueSize(): number {
  return queue.length;
}
