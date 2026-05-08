import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export type ListIpBlacklistsQuery = QueryParams & {
  page?: number;
  perPage?: number;
  ip?: string;
};

export type IpBlacklist = {
  id: number;
  name: string;
  source_ip: string;
  protocol: string;
  port: number;
  created_at?: string;
  updated_at?: string;
};

export type ListIpBlacklistsResponse = {
  data: IpBlacklist[];
  rowCount: number;
  page: number;
  pageCount: number;
  code?: number;
};

export type CreateIpBlacklistRequest = {
  name: string;
  source_ip: string;
  protocol: string;
  port: number;
};

export function createIpBlacklistsApi(client: ApiClient) {
  return {
    list(query?: ListIpBlacklistsQuery) {
      return client.request<ListIpBlacklistsResponse>({
        method: "GET",
        path: "/api/iptables",
        query: query,
      });
    },

    create(data: CreateIpBlacklistRequest) {
      return client.request({
        method: "POST",
        path: "/api/iptables/add_rule",
        body: data,
      });
    },

    delete(data: any) {
      return client.request({
        method: "POST",
        path: `/api/iptables/clean_drop_rule`,
        body: data,
      });
    },

    verify(data: { query_ip: string }) {
      return client.request<{
        data: Array<{ ipset_result: boolean }>;
      }>({
        method: "POST",
        path: "/api/iptables/query_blacklist",
        body: data,
      });
    },

    refresh() {
      return client.request({
        method: "GET",
        path: "/api/iptables/update_blacklist",
      });
    },

    UpdateTime() {
      return client.request<{ data: Array<{ v: string }> }>({
        method: "GET",
        path: "/api/iptables/query_update_time",
      });
    },
  };
}
