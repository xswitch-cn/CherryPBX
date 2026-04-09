export type Credentials = { username: string; password: string };

export type TokenStore = {
  get(): string | null;
  set(token: string): void;
  clear(): void;
};

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};
