/**
 * A minimal in-memory `Storage` implementation for tests. Some Node/jsdom
 * combinations shadow jsdom's real `localStorage` with Node's own
 * (non-functional without `--localstorage-file`) experimental global, so
 * tests that exercise persistence stub it with this instead of relying on
 * the environment's `localStorage`.
 */
export function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}
