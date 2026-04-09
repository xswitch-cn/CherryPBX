import axios, { AxiosError, type AxiosInstance } from "axios";
import { DEFAULT_HEADERS } from "../constants";
import { applyBearerToken } from "../auth/apply-auth";
import { ApiError } from "../errors/api-error";
import { statusToErrorCode } from "../errors/error-codes";
import type { ApiErrorBody } from "../types/common";
import { toQueryString } from "../utils/query";
import type { ApiClientOptions, HttpResponse, RequestOptions, RequestPresetParams } from "./types";
import { normalizeBaseUrl, resolveTimeoutMs } from "./config";

function toRecordHeaders(headers: unknown): Record<string, string> {
  if (!headers || typeof headers !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers as Record<string, unknown>)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string") out[k.toLowerCase()] = v;
    else if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint")
      out[k.toLowerCase()] = String(v);
    else out[k.toLowerCase()] = JSON.stringify(v);
  }
  return out;
}

function extractRequestId(headers: Record<string, string>): string | undefined {
  return headers["x-request-id"] || headers["x-correlation-id"];
}

function resolvePreset(
  clientPreset: RequestPresetParams | undefined,
  requestPreset: RequestPresetParams | undefined,
): RequestPresetParams {
  return { ...clientPreset, ...requestPreset };
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError;
    const status = axErr.response?.status;
    const headers = toRecordHeaders(axErr.response?.headers);
    const requestId = extractRequestId(headers);

    const data = axErr.response?.data as ApiErrorBody | undefined;
    const message =
      data?.message ||
      (typeof axErr.message === "string" && axErr.message.trim()
        ? axErr.message
        : "Request failed");

    const code = statusToErrorCode(status);

    if (axErr.code === "ECONNABORTED") {
      return new ApiError({
        message: "Request timed out",
        code: "TIMEOUT",
        status,
        details: data?.details,
        requestId,
        cause: err,
      });
    }

    if (!axErr.response) {
      return new ApiError({
        message: "Network error",
        code: "NETWORK",
        details: data?.details,
        requestId,
        cause: err,
      });
    }

    return new ApiError({ message, status, code, details: data?.details, requestId, cause: err });
  }

  return new ApiError({ message: "Unknown error", code: "UNKNOWN", cause: err });
}

export function createAxiosInstance(
  options: Pick<
    ApiClientOptions,
    "baseUrl" | "timeoutMs" | "headers" | "interceptors" | "withCredentials"
  >,
): AxiosInstance {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeout = resolveTimeoutMs(options.timeoutMs);
  const headers = { ...DEFAULT_HEADERS, ...options.headers };

  const instance = axios.create({
    baseURL: baseUrl,
    timeout,
    headers,
    withCredentials: options.withCredentials,
  });

  if (options.interceptors) {
    const { onRequest, onResponse, onError } = options.interceptors;
    if (onRequest) {
      instance.interceptors.request.use((config) => onRequest(config) as typeof config);
    }
    if (onResponse) {
      instance.interceptors.response.use((response) => {
        onResponse(response);
        return response;
      });
    }
    if (onError) {
      instance.interceptors.response.use(undefined, (error: AxiosError) => {
        onError(error);
        return Promise.reject(error);
      });
    }
  }

  return instance;
}

export async function axiosRequest<TResponse, TBody = unknown>(
  instance: AxiosInstance,
  clientOptions: Pick<
    ApiClientOptions,
    | "tokenStore"
    | "headers"
    | "timeoutMs"
    | "preset"
    | "onAuthError"
    | "getAcceptLanguage"
    | "withCredentials"
  >,
  request: RequestOptions<TBody>,
): Promise<HttpResponse<TResponse>> {
  try {
    const token = clientOptions.tokenStore?.get() ?? null;
    const preset = resolvePreset(clientOptions.preset, request.preset);

    const acceptLanguage = clientOptions.getAcceptLanguage?.();
    const version = preset.version ?? (request.path.includes("/v3") ? "v3" : undefined);

    const baseHeaders: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...clientOptions.headers,
      ...request.headers,
    };
    if (acceptLanguage) baseHeaders["accept-language"] = acceptLanguage;
    if (version) baseHeaders["version"] = version;

    const headers =
      preset.disableAuth || !token ? baseHeaders : applyBearerToken(baseHeaders, token);

    const url = `${request.path}${toQueryString(request.query)}`;
    const res = await instance.request<TResponse>({
      url,
      method: request.method,
      data: request.body,
      headers,
      timeout: request.timeoutMs ?? clientOptions.timeoutMs,
      signal: request.signal,
      withCredentials: request.withCredentials ?? clientOptions.withCredentials,
      responseType: request.responseType,
    });

    if (res.data instanceof Blob) {
      const resHeaders = toRecordHeaders(res.headers);
      return {
        status: res.status,
        headers: resHeaders,
        data: res.data as TResponse,
        requestId: extractRequestId(resHeaders),
      };
    }

    if (typeof preset.successCode === "number") {
      const codeKey = preset.codeKey ?? "code";
      const authFailCode = preset.authFailCode ?? 10006;

      const dataAny = res.data as unknown as Record<string, unknown> | null;
      const codeVal = dataAny && typeof dataAny === "object" ? dataAny[codeKey] : undefined;

      if (codeVal === preset.successCode) {
        // ok
      } else if (codeVal === authFailCode) {
        clientOptions.onAuthError?.();
        throw new ApiError({
          message: "Auth failed",
          code: "UNAUTHORIZED",
          status: res.status,
          details: res.data,
        });
      } else if (typeof codeVal === "number" || typeof codeVal === "string") {
        throw new ApiError({
          message: "Business error",
          code: "BAD_REQUEST",
          status: res.status,
          details: res.data,
        });
      }
    }

    const resHeaders = toRecordHeaders(res.headers);
    return {
      status: res.status,
      headers: resHeaders,
      data: res.data,
      requestId: extractRequestId(resHeaders),
    };
  } catch (e) {
    throw toApiError(e);
  }
}
