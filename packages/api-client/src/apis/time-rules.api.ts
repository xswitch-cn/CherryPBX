import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export interface TimeRule {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

// API实际返回格式: { code, data, message }
export interface TimeResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface ListTimeRulesResponse {
  page: number;
  data: TimeRule[];
  rowCount: number;
  pageCount: number;
}

export interface ListTimeRulesQuery extends QueryParams {
  page?: number;
  page_size?: number;
  name?: string;
  status?: string;
}

export interface TimeRulesApi {
  list(query?: ListTimeRulesQuery): Promise<TimeResponse<ListTimeRulesResponse>>;
  getById(id: number): Promise<TimeResponse<TimeRule>>;
  create(data: { name: string; description?: string }[]): Promise<TimeResponse<TimeRule[]>>;
  updateById(data: {
    id: number;
    name: string;
    description?: string;
  }): Promise<TimeResponse<TimeRule>>;
  update(id: number, data: { name: string; description?: string }): Promise<TimeResponse<TimeRule>>;
  delete(ids: number[]): Promise<TimeResponse<void>>;
}

export function createTimeRulesApi(client: ApiClient): TimeRulesApi {
  return {
    async list(query) {
      const response = await client.request<TimeResponse<ListTimeRulesResponse>>({
        method: "GET",
        path: "/api/time_recurrence/templates",
        query,
      });
      return response.data;
    },

    async getById(id) {
      const response = await client.request<TimeResponse<TimeRule>>({
        method: "GET",
        path: `/api/time_recurrence/templates/${encodeURIComponent(id)}`,
      });
      return response.data;
    },

    async create(data) {
      const response = await client.request<TimeResponse<TimeRule[]>>({
        method: "POST",
        path: "/api/time_recurrence/templates",
        body: data,
      });
      return response.data;
    },

    async updateById(data) {
      const response = await client.request<TimeResponse<TimeRule>>({
        method: "PUT",
        path: "/api/time_recurrence/templates",
        body: data,
      });
      return response.data;
    },

    async update(id, data) {
      const response = await client.request<TimeResponse<TimeRule>>({
        method: "PUT",
        path: `/api/time_recurrence/templates/${encodeURIComponent(id)}`,
        body: data,
      });
      return response.data;
    },

    async delete(ids) {
      const response = await client.request<TimeResponse<void>>({
        method: "DELETE",
        path: "/api/time_recurrence/templates",
        body: ids,
      });
      return response.data;
    },
  };
}
