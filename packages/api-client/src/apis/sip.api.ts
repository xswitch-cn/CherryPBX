import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

/**
 * SIP 数据类型（匹配实际 API 响应）
 */
export interface Sip {
  aliases: string;
  context: string;
  created_at: string;
  deleted_at: string;
  description: string;
  disabled: number;
  ext_rtp_ip: string;
  ext_sip_ip: string;
  icodec: string;
  id: number;
  name: string;
  ocodec: string;
  rtp_ip: string;
  sip_ip: string;
  sip_port: string;
  updated_at: string;
  // 以下字段来自 FreeSWITCH sofia 状态
  url?: string; // SIP Profile 状态数据
  running?: boolean; // 是否正在运行
  sip_ip_expanded: string;
  sip_port_expanded: string;
  rtp_ip_expanded: string;
  ocodec_expanded: string;
  icodec_expanded: string;
  params?: any[];
}

/**
 * 查询 SIP
 */
export type ListSipQuery = QueryParams & {
  page?: number;
  perPage?: number;
};

/**
 * 创建 SIP Profile 请求
 */
export interface CreateSipRequest {
  name: string;
  description?: string;
  template?: string;
  k?: string;
  v?: string;
  disabled?: string;
  ref_id?: string;
}

/**
 * 创建响应
 */
export type CreateSipResponse = {
  success: boolean;
  data: Sip;
  message?: string;
};

/**
 * Sip 相关 API 接口
 */
export function createSipApi(client: ApiClient) {
  return {
    /**
     * 获取 SIP 列表
     */
    list() {
      return client.request<Sip[]>({
        method: "GET",
        path: "/api/sip_profiles",
      });
    },

    /**
     * 创建 SIP Profile
     */
    create(data: CreateSipRequest) {
      return client.request<{ success: boolean; data?: number; message?: string }>({
        method: "POST",
        path: "/api/sip_profiles",
        body: data,
      });
    },

    /**
     * 删除SIP Profile
     */
    delete(id: number) {
      return client.request<{ success: boolean; message?: string }>({
        method: "DELETE",
        path: `/api/sip_profiles/${encodeURIComponent(id)}`,
      });
    },

    /**
     * 获取详情
     */
    getById(id: string) {
      return client.request<Sip>({
        method: "GET",
        path: `/api/sip_profiles/${id}`,
      });
    },

    /**
     * 编辑数据
     */
    update(id: string, data: Sip) {
      return client.request<CreateSipResponse>({
        method: "PUT",
        path: `/api/sip_profiles/${id}`,
        body: data,
      });
    },

    /**
     * 获取参数
     */
    getSipParams() {
      return client.request({
        method: "GET",
        path: "/api/params/realm/SOFIAGLOBALS",
      });
    },

    /**
     * 创建参数
     */
    createParam(data: {
      k?: string;
      v?: string;
      ref_id?: string;
      disabled?: string;
      realm?: string;
    }) {
      return client.request({
        method: "POST",
        path: "/api/params",
        body: data,
      });
    },

    /**
     * 编辑参数
     */
    editParams(data: { k?: string; v?: string; id?: string; action?: string }) {
      return client.request({
        method: "PUT",
        path: `/api/params/${data.id}`,
        body: data,
      });
    },

    /**
     * 删除参数
     */
    deleteParams(id: string) {
      return client.request({
        method: "DELETE",
        path: `/api/params/${id}`,
      });
    },

    /**
     * 编辑详情参数
     */
    upDetailParams(id: string, paramsId: number, data: Record<string, any>) {
      return client.request<any>({
        method: "PUT",
        path: `/api/sip_profiles/${id}/params/${paramsId}`,
        body: data,
      });
    },

    /**
     * 添加详情参数
     */
    addDetailParams(id: string, data: Record<string, any>) {
      return client.request<any>({
        method: "POST",
        path: `/api/sip_profiles/${id}/params/`,
        body: data,
      });
    },

    /**
     * 删除详情参数
     */
    deleteDetailParams(id: string, paramsId: number) {
      return client.request<any>({
        method: "DELETE",
        path: `/api/sip_profiles/${id}/param/${paramsId}`,
      });
    },
  };
}
