import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export interface Hotline {
  id: string;
  line_number: string;
  type: string;
  numbers: string;
  description: string;
  ref_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  [key: string]: any;
}

export type ListHotlinesQuery = QueryParams & {
  page?: number;
  page_size?: number;
  language?: string;
};

export interface ListHotlinesResponse {
  rowCount: number;
  page: number;
  pageCount: number;
  data: Hotline[];
}

export function createHotlinesApi(client: ApiClient) {
  return {
    create(data: Partial<Hotline>) {
      return client.request<{ data: number }>({
        method: "POST",
        path: "/api/hotlines",
        body: data,
      });
    },

    delete(id: string) {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: `/api/hotlines/${encodeURIComponent(id)}`,
      });
    },

    get(id: string) {
      return client.request<Hotline>({
        method: "GET",
        path: `/api/hotlines/${encodeURIComponent(id)}`,
      });
    },

    list(params: { page?: number; perPage?: number; line_number?: string; numbers?: string }) {
      return client.request<ListHotlinesResponse>({
        method: "GET",
        path: "/api/hotlines",
        query: params,
      });
    },

    update(id: string, data: Partial<Hotline>) {
      return client.request<{ success: boolean }>({
        method: "PUT",
        path: `/api/hotlines/${encodeURIComponent(id)}`,
        body: data,
      });
    },

    upload(data: { dids: any[] }) {
      return client.request<{ success: boolean }>({
        method: "POST",
        path: "/api/hotlines/import",
        body: data,
      });
    },

    download(params?: { language?: string }) {
      return client.request<any[]>({
        method: "GET",
        path: "/api/hotlines/download",
        query: params,
      });
    },
  };
}
