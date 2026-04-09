import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

/**
 * 路由数据类型（匹配实际 API 响应）
 */
export interface Route {
  id: number;
  name: string;
  description?: string;
  prefix?: string; // 被叫字冠
  max_length?: number; // 最大号长
  context?: string; // 呼叫源 context
  dest_type?: string; // 目的地类型
  dest_uuid?: string; // 目的地 UUID
  body?: string; // 目的地详情
  disabled?: number; // 是否禁用 0=启用 1=禁用
  auto_record?: number; // 自动录音 0=否 1=是
  proxy_media?: number; // 代理媒体 0=否 1=是
  did_enabled?: number; // 启用 DID 0=否 1=是
  ringback_enabled?: number; // 开启彩铃 0=否 1=是
  ringback_tone?: string; // 回铃音
  media_codec?: string; // 媒体编码
  route_type?: number; // 路由类型
  cid_number?: string; // 外显号码
  dnc?: string; // 黑名单
  sdnc?: string; // 灰名单
  blacklist?: string; // 黑名单
  force_video_recording?: number; // 强制视频录音
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  params?: any[];
}

/**
 * 列表响应结构（匹配实际 API 响应）
 */
export interface ListRoutesResponse {
  page: number;
  rowCount: number; // 总记录数
  pageCount: number; // 总页数
  data: Route[];
}

/**
 * 查询路由参数
 */
export type ListRoutesQuery = QueryParams & {
  page?: number;
  perPage?: number;
  name?: string; // 按名称筛选
  dest_type?: string; // 按目的地类型筛选
  disabled?: number; // 按状态筛选
};

/**
 * 新建路由请求数据
 */
export interface CreateRouteRequest {
  name: string;
  description?: string;
  prefix?: string;
  max_length: string;
  context: string;
  dest_type: string;
  dest_uuid?: string;
  body?: string;
  disabled?: number;
  auto_record?: number;
  proxy_media?: number;
  did_enabled?: number;
  ringback_enabled?: number;
  media_codec?: string;
  route_type?: number;
  cid_number?: string;
  dnc?: string;
  sdnc?: string;
  blacklist?: string;
  action?: string;
}

/**
 * 创建路由响应
 */
export type CreateRouteResponse = {
  success: boolean;
  data: Route;
  message?: string;
};

export interface DictItem {
  id: number;
  k: string;
  v?: string;
}

/**
 * 呼叫源
 */
export interface ContextItem {
  id: string;
  key: string;
  name: string;
}

/**
 * 黑白名单
 */
export interface BlackItem {
  id: string;
  list_type: string;
  name: string;
}

/**
 * Routes 相关 API 接口
 */
export function createRoutesApi(client: ApiClient) {
  return {
    /**
     * 获取路由列表
     */
    list(query?: ListRoutesQuery) {
      return client.request<ListRoutesResponse>({
        method: "GET",
        path: "/api/routes",
        query,
      });
    },

    /**
     * 获取路由详情
     */
    getById(id: string) {
      return client.request<Route>({
        method: "GET",
        path: `/api/routes/${id}`,
        query: { with_params: true },
      });
    },

    /**
     * 创建路由
     */
    create(data: CreateRouteRequest) {
      return client.request<CreateRouteResponse>({
        method: "POST",
        path: "/api/routes",
        body: data,
      });
    },

    /**
     * 导入路由
     */
    upload(data: any) {
      return client.request({
        method: "POST",
        path: "/api/routes/upload",
        body: data,
      });
    },

    /**
     * 更新路由
     */
    update(id: string, data: Partial<CreateRouteRequest>) {
      return client.request<CreateRouteResponse>({
        method: "PUT",
        path: `/api/routes/${id}`,
        body: data,
      });
    },

    /**
     * 删除路由
     */
    delete(id: number) {
      return client.request<{ success: boolean; message?: string }>({
        method: "DELETE",
        path: `/api/routes/${encodeURIComponent(id)}`,
      });
    },

    /**
     * 导出路由
     */
    download(query: any) {
      return client.request({
        method: "GET",
        path: "/api/routes/download",
        query,
      });
    },

    /**
     * 获取呼叫源
     */
    getContexts() {
      return client.request<{ data: ContextItem[] }>({
        method: "GET",
        path: "/api/contexts",
      });
    },

    /**
     * 黑白名单
     */
    getBlacklists() {
      return client.request<{ data: BlackItem[] }>({
        method: "GET",
        path: "/api/blacklists",
      });
    },

    getDicts(realm?: string) {
      return client.request<DictItem[]>({
        method: "GET",
        path: "/api/dicts",
        query: { realm },
      });
    },

    /**
     * 获取会议
     */
    getConferenceRooms() {
      return client.request<{ data: any }>({
        method: "GET",
        path: "/api/conference_rooms",
      });
    },

    /**
     * 获取预约会议
     */
    getReservationMeetings() {
      return client.request<{ data: any }>({
        method: "GET",
        path: "/api/meetings/user_id",
      });
    },

    /**
     * 获取会议模板
     */
    getConferenceProfiles() {
      return client.request<any[]>({
        method: "GET",
        path: "/api/conference_profiles",
      });
    },

    /**
     * 获取ivr
     */
    getIvrs() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/ivrs",
      });
    },

    /**
     * 获取队列
     */
    getQueues() {
      return client.request<any[]>({
        method: "GET",
        path: "/api/xui_callcenters",
      });
    },

    /**
     * 获取网关
     */
    getGateways() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/gateways",
      });
    },

    /**
     * 获取分机网关
     */
    getExtensionsGateways() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/extensions/gateway",
      });
    },

    /**
     * 获取中继
     */
    getTrunks() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/trunks",
      });
    },

    /**
     * 获取中继组
     */
    getTrunkGroups() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/trunk_groups",
      });
    },

    /**
     * 获取脚本
     */
    getScripts() {
      return client.request<any[]>({
        method: "GET",
        path: "/api/media_files/scripts_list",
      });
    },

    /**
     * 获取积木
     */
    getBlocks() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/blocks",
      });
    },

    /**
     * 获取分配器
     */
    getDistributors() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/distributors",
      });
    },

    /**
     * 获取Ai机器人
     */
    getAiRobots() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/ai_robot",
      });
    },

    /**
     * 获取呼叫流程
     */
    getCallflows() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/callflows",
      });
    },

    /**
     * 获取XUI_SCRIPTS
     */
    getXuiScripts() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/dicts/realm/XUI_SCRIPTS",
      });
    },

    /**
     * 新增参数
     */
    addParams(id: string, data: { k: string; v: string }) {
      return client.request<{ data: any[] }>({
        method: "POST",
        path: `/api/routes/${id}/params`,
        body: data,
      });
    },

    /**
     * 编辑参数
     */
    editParams(id: string, data: { k: string; v: string; id?: number }) {
      return client.request<{ data: any[] }>({
        method: "PUT",
        path: `/api/routes/${id}/params/${data.id}`,
        body: data,
      });
    },

    /**
     * 拖拽
     */
    drag(start_id?: number, end_id?: number) {
      return client.request<{ data: any[] }>({
        method: "PUT",
        path: `/api/routes/drag/${start_id}/${end_id}`,
      });
    },

    /**
     * 删除参数
     */
    deleteParams(id: string, paramId: number) {
      return client.request<{ data: any[] }>({
        method: "DELETE",
        path: `/api/routes/${id}/param/${paramId}`,
      });
    },

    /**
     * 状态编辑
     */
    editDisabled(id: string, data: { action: string; id: number }) {
      return client.request<{ data: any[] }>({
        method: "PUT",
        path: `/api/routes/${id}/params/${data.id}`,
        body: data,
      });
    },

    /**
     * 获取号码变换表
     */
    getNumberTranslation() {
      return client.request<{ data: any[] }>({
        method: "GET",
        path: "/api/number_translation?page=1&perPage=5000",
      });
    },
  };
}
