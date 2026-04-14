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
  type Hotline,
  type DOD,
  type ListDodsQuery,
  type ListDodsResponse,
  type ListMediaFilesQuery,
  type ListMediaFilesResponse,
  type CreateGatewayRequest,
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

// 导出各个 API 模块的单例实例
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

// 导出常用类型
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
  DOD,
  ListDodsQuery,
  ListDodsResponse,
  Hotline,
  CreateGatewayRequest,
};
