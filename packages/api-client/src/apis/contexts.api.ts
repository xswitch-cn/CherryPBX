import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export type ListContextsQuery = QueryParams & {
  page?: number;
  perPage?: number;
};

export type Context = {
  id: number;
  name: string;
  description: string;
  identifier: string;
  hotline_enabled: string;
  key?: string;
};

export type ListContextsResponse = {
  data: Context[];
  rowCount: number;
  page: number;
  code?: number;
};

export interface ContextsApi {
  list(query?: ListContextsQuery): ReturnType<ApiClient["request"]>;
  get(id: number | string): ReturnType<ApiClient["request"]>;
  create(data: any): ReturnType<ApiClient["request"]>;
  update(id: number | string, data: any): ReturnType<ApiClient["request"]>;
  delete(id: number | string): ReturnType<ApiClient["request"]>;
  toggle(id: number | string): ReturnType<ApiClient["request"]>;
}

export function createContextsApi(client: ApiClient): ContextsApi {
  return {
    list(query?: ListContextsQuery) {
      return client.request<ListContextsResponse>({
        method: "GET",
        path: "/api/contexts",
        query: query,
      });
    },

    get(id: number | string) {
      return client.request<Context>({
        method: "GET",
        path: `/api/contexts/${id}`,
      });
    },

    create(data: any) {
      return client.request({
        method: "POST",
        path: "/api/contexts",
        body: data,
      });
    },

    update(id: number | string, data: any) {
      return client.request({
        method: "PUT",
        path: `/api/contexts/${id}`,
        body: data,
      });
    },

    delete(id: number | string) {
      return client.request({
        method: "DELETE",
        path: `/api/contexts/${id}`,
      });
    },

    toggle(id: number | string) {
      return client.request({
        method: "PUT",
        path: `/api/contexts/${id}`,
        body: { action: "toggle" },
      });
    },
  };
}
