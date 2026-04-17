import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export type ListBlacklistsQuery = QueryParams & {
  page?: number;
  perPage?: number;
};

export type BlacklistNumber = {
  id: number;
  k: string;
  v: string;
};

export type Blacklist = {
  id: number;
  name: string;
  description: string;
  list_type: string;
  limit_user_type: string;
  params?: BlacklistNumber[];
};

export type ListBlacklistsResponse = {
  data: Blacklist[];
  rowCount: number;
  page: number;
  code?: number;
};

export interface BlacklistsApi {
  list(query?: ListBlacklistsQuery): ReturnType<ApiClient["request"]>;
  get(id: number | string): ReturnType<ApiClient["request"]>;
  create(data: any): ReturnType<ApiClient["request"]>;
  update(id: number | string, data: any): ReturnType<ApiClient["request"]>;
  delete(id: number | string): ReturnType<ApiClient["request"]>;
  download(language?: string): ReturnType<ApiClient["request"]>;
  import(data: any): ReturnType<ApiClient["request"]>;
  addNumber(blacklistId: number | string, data: any): ReturnType<ApiClient["request"]>;
  updateNumber(
    blacklistId: number | string,
    numberId: number | string,
    data: any,
  ): ReturnType<ApiClient["request"]>;
  deleteNumber(
    blacklistId: number | string,
    numberId: number | string,
  ): ReturnType<ApiClient["request"]>;
  importNumbers(blacklistId: number | string, data: any): ReturnType<ApiClient["request"]>;
}

export function createBlacklistsApi(client: ApiClient): BlacklistsApi {
  return {
    list(query?: ListBlacklistsQuery) {
      return client.request<ListBlacklistsResponse>({
        method: "GET",
        path: "/api/blacklists",
        query: query,
      });
    },

    get(id: number | string) {
      return client.request<Blacklist>({
        method: "GET",
        path: `/api/blacklists/${id}`,
      });
    },

    create(data: any) {
      return client.request({
        method: "POST",
        path: "/api/blacklists",
        body: data,
      });
    },

    update(id: number | string, data: any) {
      return client.request({
        method: "PUT",
        path: `/api/blacklists/${id}`,
        body: data,
      });
    },

    delete(id: number | string) {
      return client.request({
        method: "DELETE",
        path: `/api/blacklists/${id}`,
      });
    },

    download(language?: string) {
      return client.request({
        method: "GET",
        path: "/api/blacklists/download",
        query: language ? { language } : undefined,
      });
    },

    import(data: any) {
      return client.request({
        method: "POST",
        path: "/api/blacklists/import",
        body: data,
      });
    },

    addNumber(blacklistId: number | string, data: any) {
      return client.request({
        method: "POST",
        path: `/api/blacklists/${blacklistId}/lists`,
        body: data,
      });
    },

    updateNumber(blacklistId: number | string, numberId: number | string, data: any) {
      return client.request({
        method: "PUT",
        path: `/api/blacklists/${blacklistId}/lists/${numberId}`,
        body: data,
      });
    },

    deleteNumber(blacklistId: number | string, numberId: number | string) {
      return client.request({
        method: "DELETE",
        path: `/api/blacklists/${blacklistId}/lists/${numberId}`,
      });
    },

    importNumbers(blacklistId: number | string, data: any) {
      return client.request({
        method: "POST",
        path: `/api/blacklists/${blacklistId}/import/`,
        body: data,
      });
    },
  };
}
