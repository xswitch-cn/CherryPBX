export { createClient } from "./client/create-client";
export { createAxiosInstance, axiosRequest } from "./client/axios";

export { ApiError } from "./errors/api-error";
export { API_ERROR_CODES, statusToErrorCode } from "./errors/error-codes";
export type { ApiErrorCode } from "./errors/error-codes";

export {
  createMemoryTokenStore,
  createStorageTokenStore,
  createLocalStorageTokenStore,
  createSessionStorageTokenStore,
} from "./auth/token-store";
export { applyBearerToken } from "./auth/apply-auth";
export type { TokenStore, Credentials, StorageLike } from "./auth/types";

export type {
  ApiClient,
  ApiClientOptions,
  RequestPresetParams,
  RequestOptions,
  HttpResponse,
  HttpMethod,
  InterceptorConfig,
} from "./client/types";

export { createLiveAuthApi } from "./apis/auth.api";
export { createUsersApi } from "./apis/users.api";
export { createRoutesApi } from "./apis/routes.api";
export { createGatewaysApi } from "./apis/gateways.api";
export { createDashboardApi } from "./apis/dashboard.api";
export { createCdrsApi } from "./apis/cdrs.api";
export { createMediaFilesApi } from "./apis/mediafiles.api";
export { createConfigsApi } from "./apis/configs.api";
export { createLicenseApi } from "./apis/license.api";
export { createContextsApi } from "./apis/contexts.api";

export type { ListUsersQuery, ListUsersResponse, UsersApi } from "./apis/users.api";
export type {
  Route,
  CreateRouteRequest,
  ListRoutesQuery,
  ListRoutesResponse,
  CreateRouteResponse,
  DictItem,
  ContextItem,
  BlackItem,
} from "./apis/routes.api";
export type { ListCdrsQuery, ListCdrsResponse, RelatedCdr } from "./apis/cdrs.api";
export type {
  HostInfoResponse,
  SystemStatusResponse,
  SipStatusResponse,
  DashboardStatsResponse,
  MemoryStatsResponse,
  DiskStatsResponse,
  UptimeStatsResponse,
  ChannelStatsResponse,
} from "./apis/dashboard.api";

export { createExtensionsApi } from "./apis/extensions.api";
export type { ListExtensionsQuery, ListExtensionsResponse } from "./apis/extensions.api";

export { createDodsApi } from "./apis/dods.api";
export type { ListDodsQuery, ListDodsResponse, DOD } from "./apis/dods.api";

export { createHotlinesApi } from "./apis/hotlines.api";
export type { Hotline } from "./apis/hotlines.api";
export type { MediaFile, ListMediaFilesQuery, ListMediaFilesResponse } from "./apis/mediafiles.api";

export type {
  Gateway,
  ListGatewaysQuery,
  CreateGatewayRequest,
  CreateGatewayResponse,
  SiptItem,
} from "./apis/gateways.api";

export type { License, ListLicenseQuery } from "./apis/license.api";

export type {
  LoginParams,
  LoginResponse,
  LoginResponseData,
  ResponseBase,
  LogoutResponseData,
} from "./types/auth";

export type { QueryParams, QueryValue, ApiEnvelope, ApiErrorBody } from "./types/common";
export type { User } from "./types/users";
export type { Cdr } from "./types/cdrs";
export type { Extension } from "./types/extensions";
export type {
  ListContextsQuery,
  ListContextsResponse,
  Context,
  ContextsApi,
} from "./apis/contexts.api";

export { toQueryString } from "./utils/query";
export { isBrowser, isNode, isWebWorker } from "./utils/env";
export { DEFAULT_TIMEOUT_MS, DEFAULT_HEADERS } from "./constants";
