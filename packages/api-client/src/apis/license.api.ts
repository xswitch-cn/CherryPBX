import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

/**
 * 许可证数据类型（匹配实际 API 响应）
 */
export interface License {
  id: number;
  name: string;
  server: string;
  description?: string;
  disabled?: number; // 是否禁用 0=启用 1=禁用
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/**
 * 查询许可证参数
 */
export type ListLicenseQuery = QueryParams & {
  page?: number;
  perPage?: number;
  type?: string;
  name?: string; // 按名称筛选
};

/**
 * 列表响应结构（匹配实际 API 响应）
 */
export interface ListLicenseResponse {
  page: number;
  rowCount: number; // 总记录数
  pageCount: number; // 总页数
  data: License[];
}

/**
 * 新建请求数据
 */
export interface CreateLicenseRequest {
  name: string;
  description?: string;
}

/**
 * 创建响应
 */
export type CreateLicenseResponse = {
  success: boolean;
  data: License;
  message?: string;
};

/**
 * License 相关 API 接口
 */
export function createLicenseApi(client: ApiClient) {
  return {
    /**
     * 获取许可证列表
     */
    list(query?: ListLicenseQuery) {
      return client.request<ListLicenseResponse>({
        method: "GET",
        path: "/api/licenses",
        query,
      });
    },

    /**
     * 创建许可证
     */
    create(data: CreateLicenseRequest) {
      return client.request<CreateLicenseResponse>({
        method: "POST",
        path: "/api/licenses",
        body: data,
      });
    },

    /**
     * 删除License
     */
    delete(id: number) {
      return client.request<{ success: boolean; message?: string }>({
        method: "DELETE",
        path: `/api/licenses/${encodeURIComponent(id)}`,
      });
    },

    /**
     * 获取详情
     */
    getById(id: string) {
      return client.request<License>({
        method: "GET",
        path: `/api/licenses/${id}`,
      });
    },

    /**
     * 编辑数据
     */
    update(id: string, data: License) {
      return client.request<CreateLicenseResponse>({
        method: "PUT",
        path: `/api/licenses/${id}`,
        body: data,
      });
    },

    /**
     * 添加许可证模块
     */
    addLicenseModule(licenseId: string, data: Record<string, any>) {
      return client.request<{ success: boolean; data?: any; message?: string }>({
        method: "POST",
        path: `/api/licenses/${licenseId}`,
        body: data,
      });
    },
  };
}
