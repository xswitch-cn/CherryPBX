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
export { createBlacklistsApi } from "./apis/blacklists.api";
export { createConferencesApi } from "./apis/conferences.api";
export { createSipApi } from "./apis/sip.api";
export { createIvrsApi } from "./apis/ivrs.api";

export type { ListUsersQuery, ListUsersResponse, UsersApi } from "./apis/users.api";
export type { ListIvrsQuery, ListIvrsResponse, IVR, IvrsApi } from "./apis/ivrs.api";
export type {
  ListConferencesQuery,
  ListConferencesResponse,
  Conference,
  ConferencesApi,
  ConferenceProfile,
  UserItem,
} from "./apis/conferences.api";
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
export type { ListHotlinesQuery } from "./apis/hotlines.api";
export type { Hotline, ListHotlinesResponse } from "./apis/hotlines.api";

export { createNumberTransformApi } from "./apis/number-transform.api";
export type {
  ListNumberTransformsQuery,
  ListNumberTransformsResponse,
  NumberTransform,
  NtsNmbers,
  NtsNmbersInfo,
  NumberTransformsApi,
  NumberTransformItem,
} from "./apis/number-transform.api";

export { createTimeRulesApi } from "./apis/time-rules.api";
export type {
  ListTimeRulesQuery,
  ListTimeRulesResponse,
  TimeRule,
  TimeRulesApi,
  TimeResponse,
} from "./apis/time-rules.api";
export type { MediaFile, ListMediaFilesQuery, ListMediaFilesResponse } from "./apis/mediafiles.api";

export { createLogsApi } from "./apis/logs.api";
export type { LogConfig, LogSetting, LogsApi } from "./apis/logs.api";
export type { LogParam, LogMap } from "./apis/logs.api";

export { createDiagnosticsApi } from "./apis/diagnostics.api";
export type {
  DiagnosticsApi,
  PingRequest,
  PingResponse,
  CaptureRequest,
  CaptureResponse,
} from "./apis/diagnostics.api";

export type {
  Gateway,
  ListGatewaysQuery,
  CreateGatewayRequest,
  CreateGatewayResponse,
  SiptItem,
} from "./apis/gateways.api";

export type { License, ListLicenseQuery, CreateLicenseRequest } from "./apis/license.api";
export type { Sip, ListSipQuery, CreateSipRequest } from "./apis/sip.api";

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

export type {
  Blacklist,
  ListBlacklistsQuery,
  ListBlacklistsResponse,
  BlacklistsApi,
} from "./apis/blacklists.api";

export { createIpBlacklistsApi } from "./apis/ip-blacklists.api";
export type {
  IpBlacklist,
  ListIpBlacklistsQuery,
  ListIpBlacklistsResponse,
  CreateIpBlacklistRequest,
} from "./apis/ip-blacklists.api";

export { createAclApi } from "./apis/acl.api";
export type { Acl, ListAclQuery } from "./apis/acl.api";

export { toQueryString } from "./utils/query";
export { isBrowser, isNode, isWebWorker } from "./utils/env";
export { DEFAULT_TIMEOUT_MS, DEFAULT_HEADERS } from "./constants";
