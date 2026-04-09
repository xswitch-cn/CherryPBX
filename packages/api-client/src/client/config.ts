import { DEFAULT_TIMEOUT_MS } from "../constants";

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function resolveTimeoutMs(timeoutMs: number | undefined): number {
  return timeoutMs ?? DEFAULT_TIMEOUT_MS;
}
