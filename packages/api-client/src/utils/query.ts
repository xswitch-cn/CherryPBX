import type { QueryParams } from "../types/common";

export function toQueryString(query: QueryParams | undefined): string {
  if (!query) return "";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }

  const s = params.toString();
  return s ? `?${s}` : "";
}
