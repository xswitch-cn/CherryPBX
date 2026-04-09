import type { ApiClient } from "../client/types";

export interface Hotline {
  id: number;
  line_number: string;
  type: string;
  extn: string;
  [key: string]: any;
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

    delete(id: number) {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: `/api/hotlines/${encodeURIComponent(id)}`,
      });
    },

    list() {
      return client.request<Hotline[]>({
        method: "GET",
        path: "/api/hotlines",
      });
    },
  };
}
