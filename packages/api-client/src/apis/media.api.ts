import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

/**
 * Media 数据类型（匹配实际 API 响应）
 */
export interface Media {
  file_size: number;
  original_file_name: string;
  description: string;
  domain: string;
  type: string;
  name: string;
  file_name: string;
  channel_uuid: string;
  abs_path: string;
  id: number;
  rel_path: string;
  created_at: string;
  deleted_at: string;
  updated_at: string;
  processing_flag: number;
  meta: string;
  ext: string;
  dir_path: string;
  mime: string;
  geo_position: string;
  thumb_path: string;
}

/**
 * 列表响应结构（匹配实际 API 响应）
 */
export interface ListMediasResponse {
  page: number;
  rowCount: number; // 总记录数
  pageCount: number; // 总页数
  data: Media[];
}

/**
 * 查询参数
 */
export type ListMediasQuery = QueryParams & {
  page?: number;
  perPage?: number;
  type?: string;
  name?: string; // 按名称筛选
};

/**
 * 相关 API 接口
 */
export function createMediasApi(client: ApiClient) {
  return {
    /**
     * 获取列表
     */
    list(query?: ListMediasQuery) {
      return client.request<ListMediasResponse>({
        method: "GET",
        path: "/api/media_files",
        query,
      });
    },
  };
}
