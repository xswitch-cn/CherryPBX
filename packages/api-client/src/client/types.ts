import type { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import type { TokenStore } from "../auth/types";
import type { QueryParams } from "../types/common";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestPresetParams = {
  successCode?: number;
  authFailCode?: number;
  codeKey?: string;
  version?: "v3";
  disableAuth?: boolean;
  keyTransTo?: string;
};

export type RequestOptions<TBody = unknown> = {
  method: HttpMethod;
  path: string;
  query?: QueryParams;
  body?: TBody;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  withCredentials?: boolean;
  responseType?: AxiosRequestConfig["responseType"];
  preset?: RequestPresetParams;
};

export type HttpResponse<T> = {
  status: number;
  headers: Record<string, string>;
  data: T;
  requestId?: string;
};

export type InterceptorConfig = {
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  onResponse?: (response: unknown) => unknown;
  onError?: (error: AxiosError) => void;
};

export type ApiClientOptions = {
  baseUrl: string;
  tokenStore?: TokenStore;
  headers?: Record<string, string>;
  timeoutMs?: number;
  axios?: AxiosInstance;
  preset?: RequestPresetParams;
  onAuthError?: () => void;
  getAcceptLanguage?: () => string | undefined;
  interceptors?: InterceptorConfig;
  withCredentials?: boolean;
};

export type ApiClient = {
  request<TResponse, TBody = unknown>(
    options: RequestOptions<TBody>,
  ): Promise<HttpResponse<TResponse>>;
};
