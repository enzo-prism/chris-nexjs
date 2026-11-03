/**
 * Test-only Map-backed stand-in for `next/cache`.
 * Successful return values are stored; thrown errors are never cached.
 */
type CacheEntry = { readonly value: unknown };

const store = new Map<string, CacheEntry>();

function storageKey(keyParts: readonly string[]): string {
  return JSON.stringify(keyParts);
}

export function unstable_cache<T extends (...args: never[]) => Promise<unknown>>(
  cb: T,
  keyParts: readonly string[] = [],
  _options?: { readonly revalidate?: number | false; readonly tags?: readonly string[] },
): T {
  const cacheKey = storageKey(keyParts);
  const wrapped = (async (...args: never[]) => {
    const hit = store.get(cacheKey);
    if (hit) return hit.value;
    const value = await cb(...args);
    store.set(cacheKey, { value });
    return value;
  }) as T;
  return wrapped;
}

export function clearUnstableCacheForTests(): void {
  store.clear();
}

export function peekUnstableCacheForTests(keyParts: readonly string[]): unknown {
  return store.get(storageKey(keyParts))?.value;
}
