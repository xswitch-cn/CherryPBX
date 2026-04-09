import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

/**
 * 网关数据类型（匹配实际 API 响应）
 */
export interface Gateway {
  id: string;
  name: string;
  created_at?: string;
  deleted_at?: string;
  description?: string;
  disabled?: string;
  dnc?: string;
  location?: string;
  password?: string;
  profile_id?: string;
  realm?: string;
  register?: string;
  sdnc?: string;
  updated_at?: string;
  username?: string;
  class_name?: string;
  params?: any[];
  variables?: any[];
  gateway_status?: string;
  gateway_state?: string;
  gwstatus?: string;
}

/**
 * 创建网关请求数据
 */
export interface CreateGatewayRequest {
  name: string;
  realm: string;
  username: string;
  password: string;
  description?: string;
  profile_id?: string;
  register?: string;
}

/**
 * 创建网关响应
 */
export interface CreateGatewayResponse {
  success: boolean;
  data: string;
  message?: string;
}

/**
 * 列表响应结构（匹配实际 API 响应）
 */
export interface ListGatewaysResponse {
  page: number;
  rowCount: number; // 总记录数
  pageCount: number; // 总页数
  data: Gateway[];
}

/**
 * 查询网关参数
 */
export type ListGatewaysQuery = QueryParams & {
  page?: number;
  perPage?: number;
};

export interface SiptItem {
  name: string;
  id: number;
}

/**
 * gateways 相关 API 接口
 */
export function createGatewaysApi(client: ApiClient) {
  return {
    /**
     * 获取网关列表
     */
    list(query?: ListGatewaysQuery) {
      return client.request<ListGatewaysResponse>({
        method: "GET",
        path: "/api/gateways",
        query,
      });
    },

    /**
     * 创建网关
     */
    create(data: CreateGatewayRequest) {
      return client.request<CreateGatewayResponse>({
        method: "POST",
        path: "/api/gateways",
        body: data,
      });
    },

    /**
     * 删除网关
     */
    delete(id: string) {
      return client.request<{ success: boolean; message?: string }>({
        method: "DELETE",
        path: `/api/gateways/${id}`,
      });
    },

    /**
     * 更新状态
     */
    upDisabled(id: string, data: { disabled: number }) {
      return client.request({
        method: "PUT",
        path: `/api/gateways/${id}`,
        body: data,
      });
    },

    /**
     * 获取网关详情
     */
    getById(id: string) {
      return client.request<Gateway>({
        method: "GET",
        path: `/api/gateways/${id}`,
      });
    },

    /**
     * 获取网关状态
     */
    getGateways() {
      return client.request<Gateway>({
        method: "GET",
        path: `/api/gateways/list`,
      });
    },

    /**
     * 获取网关状态1
     */
    getGateways1() {
      return client.request<Gateway>({
        method: "GET",
        path: `/api/gateways/list1`,
      });
    },

    /**
     * 更新网关状态
     */
    upGateways(data: any) {
      return client.request({
        method: "PUT",
        path: `/api/gateways/control`,
        body: data,
      });
    },

    /**
     * 更新网关
     */
    update(id: string, data: Gateway) {
      return client.request<CreateGatewayResponse>({
        method: "PUT",
        path: `/api/gateways/${id}`,
        body: data,
      });
    },

    /**
     * 获取sip配置
     */
    getSipProfiles() {
      return client.request<SiptItem[]>({
        method: "GET",
        path: `/api/sip_profiles`,
      });
    },

    /**
     * 获取lparams
     */
    getLparams(language: string) {
      return client.request<any[]>({
        method: "GET",
        path: `/api/gateways/lparams?language=${language}`,
      });
    },

    /**
     * 获取关联信息
     */
    getRelevanceInfo(id: string) {
      return client.request<any[]>({
        method: "GET",
        path: `/api/gateways/relevance_info/${id}`,
      });
    },

    /**
     * 添加变量
     */
    addVariable(id: string, data: { k: string; v: string; direction?: number }) {
      return client.request<CreateGatewayResponse>({
        method: "POST",
        path: `/api/gateways/${id}/variables`,
        body: data,
      });
    },

    /**
     * 添加参数
     */
    addParams(id: string, data: { k: string; v: string }) {
      return client.request<CreateGatewayResponse>({
        method: "POST",
        path: `/api/gateways/${id}/params`,
        body: data,
      });
    },

    /**
     * 删除参数
     */
    deleteParams(id: string, paramId: number) {
      return client.request<{ data: any[] }>({
        method: "DELETE",
        path: `/api/gateways/${id}/param/${paramId}`,
      });
    },

    /**
     * 删除变量
     */
    deleteVariable(id: string, variableId: number) {
      return client.request<{ data: any[] }>({
        method: "DELETE",
        path: `/api/gateways/${id}/variable/${variableId}`,
      });
    },

    /**
     * 更新参数
     */
    upParams(id: string, paramsId: number, data: { v?: string; k?: string; action?: string }) {
      return client.request<CreateGatewayResponse>({
        method: "PUT",
        path: `/api/gateways/${id}/params/${paramsId}`,
        body: data,
      });
    },

    /**
     * 更新变量
     */
    upVariable(
      id: string,
      variableId: number,
      data: { v?: string; k?: string; direction?: string; action?: string },
    ) {
      return client.request<CreateGatewayResponse>({
        method: "PUT",
        path: `/api/gateways/${id}/variables/${variableId}`,
        body: data,
      });
    },
  };
}
