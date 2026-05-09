import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

/**
 * 数据类型（匹配实际 API 响应）
 */
export interface Acl {
  id: string;
  rule: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/**
 * 查询参数
 */
export type ListAclQuery = QueryParams & {
  page?: number;
  perPage?: number;
};

/**
 * 列表响应结构（匹配实际 API 响应）
 */
export interface ListAclResponse {
  page: number;
  rowCount: number; // 总记录数
  pageCount: number; // 总页数
  data: Acl[];
}

/**
 * 新建请求数据
 */
export interface CreateAclRequest {
  name: string;
  rule?: string;
}

/**
 * 创建响应
 */
export type CreateAclResponse = {
  success: boolean;
  data: Acl;
  message?: string;
};

/**
 *  相关 API 接口
 */
export function createAclApi(client: ApiClient) {
  return {
    /**
     * 获取列表
     */
    list(query?: ListAclQuery) {
      return client.request<ListAclResponse>({
        method: "GET",
        path: "/api/acls",
        query,
      });
    },

    /**
     * 创建
     */
    create(data: CreateAclRequest) {
      return client.request<CreateAclResponse>({
        method: "POST",
        path: "/api/acls",
        body: data,
      });
    },

    /**
     * 删除
     */
    delete(id: string) {
      return client.request<{ success: boolean; message?: string }>({
        method: "DELETE",
        path: `/api/acls/${encodeURIComponent(id)}`,
      });
    },
  };
}
