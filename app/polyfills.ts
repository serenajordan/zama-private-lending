if (typeof globalThis.global === 'undefined') {
  (globalThis as any).global = globalThis;
}

if (typeof globalThis.self === 'undefined') {
  (globalThis as any).self = globalThis;
}

// Dev-only: silence Coinbase metrics noise to keep console clean
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalFetch = window.fetch;
  try {
    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const input = args[0];
      const url = typeof input === 'string' ? input : input?.toString?.() ?? '';
      // Coinbase Wallet SDK metrics
      if (url.includes('cca-lite.coinbase.com/metrics')) {
        // Return a noop 204 response
        return new Response(null, { status: 204, statusText: 'No Content (dev silenced)' });
      }
      return originalFetch(...args);
    };
  } catch {
    // no-op, keep original fetch if anything goes wrong
  }
}
