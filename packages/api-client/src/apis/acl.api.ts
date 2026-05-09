import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export interface AclParams {
  id?: number;
  k?: string;
  v?: string;
  node_type?: string;
  max_port?: string;
  min_port?: string;
  port?: string;
  ports?: string;
  port_type?: number;
}

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
  params?: AclParams[];
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

    /**
     * 获取详情
     */
    getById(id: string) {
      return client.request<Acl>({
        method: "GET",
        path: `/api/acls/${id}`,
      });
    },

    /**
     * 更新
     */
    update(id: string, data: Partial<CreateAclRequest>) {
      return client.request<CreateAclResponse>({
        method: "PUT",
        path: `/api/acls/${id}`,
        body: data,
      });
    },

    /**
     * 新增参数
     */
    addParams(id: string, data: AclParams) {
      return client.request<CreateAclResponse>({
        method: "POST",
        path: `/api/acls/${id}/nodes/`,
        body: data,
      });
    },

    /**
     * 更新参数
     */
    upParams(
      id: string,
      paramsId: number,
      data: { v?: string; k?: string; pv?: string; node_type?: string },
    ) {
      return client.request<CreateAclResponse>({
        method: "PUT",
        path: `/api/acls/${id}/nodes/${paramsId}`,
        body: data,
      });
    },

    /**
     * 删除参数
     */
    deleteParams(id: string, paramsId: number) {
      return client.request<CreateAclResponse>({
        method: "DELETE",
        path: `/api/acls/${id}/node/${paramsId}`,
      });
    },
  };
}
