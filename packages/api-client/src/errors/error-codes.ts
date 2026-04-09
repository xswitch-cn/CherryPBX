export const API_ERROR_CODES = [
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "INTERNAL",
  "NETWORK",
  "TIMEOUT",
  "UNKNOWN",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

const STATUS_CODE_MAP = new Map<number, ApiErrorCode>([
  [400, "BAD_REQUEST"],
  [401, "UNAUTHORIZED"],
  [403, "FORBIDDEN"],
  [404, "NOT_FOUND"],
  [409, "CONFLICT"],
  [429, "RATE_LIMITED"],
]);

export function statusToErrorCode(status: number | undefined): ApiErrorCode {
  if (!status) return "UNKNOWN";
  const code = STATUS_CODE_MAP.get(status);
  if (code) return code;
  if (status >= 500) return "INTERNAL";
  return "UNKNOWN";
}
