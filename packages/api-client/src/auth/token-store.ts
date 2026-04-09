import type { TokenStore, StorageLike } from "./types";

export function createMemoryTokenStore(): TokenStore {
  let token: string | null = null;

  return {
    get() {
      return token;
    },
    set(next) {
      token = next;
    },
    clear() {
      token = null;
    },
  };
}

export function createStorageTokenStore(
  storage: StorageLike,
  key: string = "access_token",
): TokenStore {
  return {
    get() {
      return storage.getItem(key);
    },
    set(token: string) {
      storage.setItem(key, token);
    },
    clear() {
      storage.removeItem(key);
    },
  };
}

export function createLocalStorageTokenStore(key?: string): TokenStore {
  if (typeof window === "undefined" || !window.localStorage) {
    return createMemoryTokenStore();
  }
  return createStorageTokenStore(window.localStorage, key);
}

export function createSessionStorageTokenStore(key?: string): TokenStore {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return createMemoryTokenStore();
  }
  return createStorageTokenStore(window.sessionStorage, key);
}
