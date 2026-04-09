export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export type ApiEnvelope<T> = {
  data: T;
  requestId?: string;
};

export type ApiErrorBody = {
  message?: string;
  code?: string;
  details?: unknown;
  requestId?: string;
};
