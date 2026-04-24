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
}

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
     * 获取参数
     */
    getSipParams() {
      return client.request({
        method: "GET",
        path: "/api/params/realm/SOFIAGLOBALS",
      });
    },
  };
}
