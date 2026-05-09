import {
  createClient,
  type ApiClient,
  type TokenStore,
  createRoutesApi,
  createGatewaysApi,
  createUsersApi,
  createLiveAuthApi,
  createConfigsApi,
  createLicenseApi,
  createContextsApi,
  createBlacklistsApi,
  createConferencesApi,
  createSipApi,
  createIvrsApi,
  createIpBlacklistsApi,
  createAclApi,
  type Route,
  type ListRoutesQuery,
  type ListRoutesResponse,
  type CreateRouteRequest,
  type CreateRouteResponse,
  type ContextItem,
  type DictItem,
  type Extension,
  type ListExtensionsQuery,
  type Cdr,
  type ListCdrsQuery,
  type ListCdrsResponse,
  type RelatedCdr,
  type MediaFile,
  createExtensionsApi,
  createCdrsApi,
  createDodsApi,
  createHotlinesApi,
  createMediaFilesApi,
  createNumberTransformApi,
  createTimeRulesApi,
  createLogsApi,
  createDiagnosticsApi,
  type Hotline,
  type DOD,
  type ListHotlinesResponse,
  type ListHotlinesQuery,
  type ListDodsQuery,
  type ListDodsResponse,
  type ListMediaFilesQuery,
  type ListMediaFilesResponse,
  type CreateGatewayRequest,
  type Context,
  type ListContextsQuery,
  type ListContextsResponse,
  type Blacklist,
  type ListBlacklistsQuery,
  type ListBlacklistsResponse,
  type BlacklistsApi,
  type Conference,
  type ListConferencesQuery,
  type ListConferencesResponse,
  type ConferencesApi,
  type ConferenceProfile,
  type UserItem,
  type NumberTransform,
  type NtsNmbers,
  type NtsNmbersInfo,
  type ListNumberTransformsQuery,
  type ListNumberTransformsResponse,
  type NumberTransformsApi,
  type NumberTransformItem,
  type TimeRule,
  type ListTimeRulesQuery,
  type ListTimeRulesResponse,
  type TimeRulesApi,
  type TimeResponse,
  type LogConfig,
  type LogSetting,
  type LogParam,
  type LogMap,
  type LogsApi,
  type IVR,
  type ListIvrsQuery,
  type ListIvrsResponse,
  type IvrsApi,
  type DiagnosticsApi,
} from "@repo/api-client";
import { getApiBaseUrl } from "@/lib/api-base-url";

const API_BASE_URL = getApiBaseUrl();

class ZustandTokenStore implements TokenStore {
  private getStore() {
    const { useAuthStore } = require("@/stores/auth-store");
    return useAuthStore.getState();
  }

  get(): string | null {
    return this.getStore().token;
  }

  set(token: string): void {
    this.getStore().setToken(token);
  }

  clear(): void {
    this.getStore().logout();
  }
}

export const tokenStore = new ZustandTokenStore();

export const apiClient: ApiClient = createClient({
  baseUrl: API_BASE_URL,
  tokenStore,
  withCredentials: true,
  onAuthError: () => {
    tokenStore.clear();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
});

export const routesApi = createRoutesApi(apiClient);
export const gatewaysApi = createGatewaysApi(apiClient);
export const usersApi = createUsersApi(apiClient);
export const authApi = createLiveAuthApi(apiClient);
export const extensionsApi = createExtensionsApi(apiClient);
export const cdrsApi = createCdrsApi(apiClient);
export const dodsApi = createDodsApi(apiClient);
export const hotlinesApi = createHotlinesApi(apiClient);
export const mediaFilesApi = createMediaFilesApi(apiClient);
export const configsApi = createConfigsApi(apiClient);
export const licenseApi = createLicenseApi(apiClient);
export const contextsApi = createContextsApi(apiClient);
export const blacklistsApi = createBlacklistsApi(apiClient);
export const conferencesApi = createConferencesApi(apiClient);
export const sipApi = createSipApi(apiClient);
export const ivrsApi = createIvrsApi(apiClient);
export const numberTransformApi = createNumberTransformApi(apiClient);
export const timeRulesApi = createTimeRulesApi(apiClient);
export const logsApi = createLogsApi(apiClient);
export const diagnosticsApi = createDiagnosticsApi(apiClient);
export const ipBlacklistsApi = createIpBlacklistsApi(apiClient);
export const AclApi = createAclApi(apiClient);

export type {
  ApiClient,
  TokenStore,
  Route,
  ListRoutesQuery,
  ListRoutesResponse,
  Extension,
  ListExtensionsQuery,
  Cdr,
  ListCdrsQuery,
  ListCdrsResponse,
  RelatedCdr,
  MediaFile,
  ListMediaFilesQuery,
  ListMediaFilesResponse,
  CreateRouteRequest,
  CreateRouteResponse,
  ContextItem,
  DictItem,
  ListHotlinesQuery,
  DOD,
  ListDodsQuery,
  ListDodsResponse,
  Hotline,
  ListHotlinesResponse,
  CreateGatewayRequest,
  Context,
  ListContextsQuery,
  ListContextsResponse,
  Blacklist,
  ListBlacklistsQuery,
  ListBlacklistsResponse,
  BlacklistsApi,
  Conference,
  ListConferencesQuery,
  ListConferencesResponse,
  ConferencesApi,
  ConferenceProfile,
  UserItem,
  NumberTransform,
  NtsNmbers,
  NtsNmbersInfo,
  ListNumberTransformsQuery,
  ListNumberTransformsResponse,
  NumberTransformsApi,
  NumberTransformItem,
  TimeRule,
  ListTimeRulesQuery,
  ListTimeRulesResponse,
  TimeRulesApi,
  TimeResponse,
  LogConfig,
  LogSetting,
  LogParam,
  LogMap,
  LogsApi,
  IVR,
  ListIvrsQuery,
  ListIvrsResponse,
  IvrsApi,
  DiagnosticsApi,
};
