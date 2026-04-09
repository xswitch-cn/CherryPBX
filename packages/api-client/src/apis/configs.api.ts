import type { ApiClient } from "../client/types";

/**
 * Configs 相关 API 接口
 */
export function createConfigsApi(client: ApiClient) {
  return {
    /**
     * 获取配置
     */
    getConfigs(key: string) {
      return client.request<any>({
        method: "GET",
        path: `/api/configs/${key}`,
      });
    },
  };
}
