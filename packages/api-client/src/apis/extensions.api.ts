import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";
import type { Extension } from "../types/extensions";

export type ListExtensionsQuery = QueryParams & {
  page?: number;
  page_size?: number;
  extn?: string;
  name?: string;
  status?: string;
  sort_field?: string;
  sort_order?: string;
  hpack?: boolean;
};

export interface ListExtensionsResponse {
  data: Extension[];
  page: number;
  pageCount: number;
  rowCount: number;
  hpack: boolean;
}

export function createExtensionsApi(client: ApiClient) {
  return {
    list(query?: ListExtensionsQuery) {
      return client.request<ListExtensionsResponse>({
        method: "GET",
        path: "/api/extensions",
        query,
      });
    },

    getById(id: number) {
      return client.request<Extension>({
        method: "GET",
        path: `/api/extensions/${encodeURIComponent(id)}`,
      });
    },

    create(data: Partial<Extension>) {
      return client.request<Extension>({
        method: "POST",
        path: "/api/extensions",
        body: data,
      });
    },

    update(id: number, data: Partial<Extension>) {
      return client.request<Extension>({
        method: "PUT",
        path: `/api/extensions/${encodeURIComponent(id)}`,
        body: data,
      });
    },

    delete(id: number) {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: `/api/extensions/${encodeURIComponent(id)}`,
      });
    },

    batchUpdate(data: Partial<Extension>) {
      return client.request<{ success: boolean }>({
        method: "POST",
        path: "/api/extensions/batch_update",
        body: data,
      });
    },

    total() {
      return client.request<{ count: number }>({
        method: "GET",
        path: "/api/extensions/total",
      });
    },

    download(query?: ListExtensionsQuery) {
      return client.request<any>({
        method: "GET",
        path: "/api/extensions/download",
        query,
      });
    },

    upload(data: { extensions: any[] }) {
      return client.request<{ data: any[] }>({
        method: "POST",
        path: "/api/extensions/upload",
        body: data,
      });
    },

    /**
     * 获取配置
     */
    getConfigs(key: string) {
      return client.request<any>({
        method: "GET",
        path: `/api/configs/${key}`,
      });
    },

    mutiAdd(data: {
      extns_start: number;
      extns_end: number;
      password: string;
      context: string;
      login: string;
    }) {
      return client.request<any>({
        method: "POST",
        path: "/api/extensions/muti_add",
        body: data,
      });
    },
  };
}
