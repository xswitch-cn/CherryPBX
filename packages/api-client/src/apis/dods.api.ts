import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export type ListDodsQuery = QueryParams & {
  page?: number;
  page_size?: number;
  extn?: string;
  hpack?: boolean;
};

export interface DOD {
  id?: number;
  ref_id?: string;
  name?: string;
  type: string;
  line_number: string;
  extn: string;
  dod_id?: string;
}

export interface ListDodsResponse {
  data: DOD[];
  page: number;
  pageCount: number;
  rowCount: number;
  hpack: boolean;
}

export function createDodsApi(client: ApiClient) {
  return {
    list(query?: ListDodsQuery) {
      return client.request<ListDodsResponse>({
        method: "GET",
        path: "/api/dods",
        query,
      });
    },

    getById(id: number) {
      return client.request<DOD>({
        method: "GET",
        path: `/api/dods/${encodeURIComponent(id)}`,
      });
    },

    create(data: Partial<DOD>) {
      return client.request<DOD>({
        method: "POST",
        path: "/api/dods",
        body: data,
      });
    },

    update(id: number, data: Partial<DOD>) {
      return client.request<DOD>({
        method: "PUT",
        path: `/api/dods/${encodeURIComponent(id)}`,
        body: data,
      });
    },

    delete(id: number) {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: `/api/dods/${encodeURIComponent(id)}`,
      });
    },
  };
}
