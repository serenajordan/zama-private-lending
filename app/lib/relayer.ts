// app/lib/relayer.ts
// Centralized relayer access with route fallbacks and verbose logging in dev

export const RELAYER_BASE: string | undefined = '/api/relayer';

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

function join(base: string, path: string) {
  if (!base.endsWith('/') && !path.startsWith('/')) return `${base}/${path}`;
  if (base.endsWith('/') && path.startsWith('/')) return `${base}${path.slice(1)}`;
  return `${base}${path}`;
}

async function requestWithFallbacks(paths: string[], init: RequestInit & { base?: string } = {}) {
  const base = init.base ?? (RELAYER_BASE as string);
  const tried: { url: string; status?: number; error?: unknown }[] = [];
  if (!base) throw new Error('[relayer] Missing proxy base');

  for (const p of paths) {
    const url = join(base, p);
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init.headers as Record<string, string>),
        },
      });
      tried.push({ url, status: res.status });
      if (res.ok) {
        let data: any = null;
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) data = await res.json();
        else data = await res.text().catch(() => null);
        if (process.env.NODE_ENV !== 'production') {
          console.info('[relayer] OK', init.method || 'GET', url, res.status);
        }
        return { url, status: res.status, data };
      }
    } catch (error) {
      tried.push({ url, error });
    }
  }
  const detail = tried.map(t => `${t.url} -> ${t.status ?? 'ERR'}`).join(', ');
  const err = new Error(`[relayer] All routes failed: ${detail}`);
  (err as any).tried = tried;
  throw err;
}

export async function health() {
  return requestWithFallbacks(['/health', '/status'], { method: 'GET' });
}

export async function publish(payload: Json) {
  return requestWithFallbacks(['/relay', '/publish', '/v0/relay'], {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function reencrypt(params: Json) {
  return requestWithFallbacks(['/reencrypt', '/re-encrypt', '/v0/reencrypt'], {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function peek(params: Json) {
  return requestWithFallbacks(['/peek', '/v0/peek'], {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function analytics(event: Json) {
  try {
    return await requestWithFallbacks(['/analytics', '/v0/analytics'], {
      method: 'POST',
      body: JSON.stringify(event),
    });
  } catch {
    // best-effort, ignore
  }
}

export async function relayerHealthy(): Promise<boolean> {
  try {
    const res = await health();
    if (process.env.NODE_ENV !== 'production') {
      console.info('[relayer] health', { base: RELAYER_BASE, url: res.url, status: res.status, data: res.data });
    }
    return true;
  } catch (e: any) {
    console.warn('[relayer] health failed', e?.message ?? e);
    return false;
  }
}

export async function encryptU64(value: bigint) {
  // Placeholder until full SDK wiring; keep API surface
  if (process.env.NODE_ENV !== 'production') {
    console.info('[relayer] encryptU64 (passthrough)', value.toString());
  }
  return value.toString();
}

// Expose internals for other modules that may need fallbacks
export const _relayerInternals = { requestWithFallbacks, join };