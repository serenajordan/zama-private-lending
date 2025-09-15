if (typeof globalThis.global === 'undefined') {
  (globalThis as any).global = globalThis;
}

if (typeof globalThis.self === 'undefined') {
  (globalThis as any).self = globalThis;
}
