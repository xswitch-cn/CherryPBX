const DEFAULT_API_BASE_URL = "/";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_API_BASE_URL;
}
