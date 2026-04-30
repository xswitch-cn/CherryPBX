import type { ApiClient } from "../client/types";

export interface LogConfig {
  id: number;
  name: string;
  description: string;
  disabled: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface LogSetting {
  id: number;
  k: string;
  v: string;
  realm: string;
  disabled: number;
  ref_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface LogParam {
  id: number;
  k: string;
  v: string;
  realm: string;
  disabled: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface LogMap {
  id: number;
  k: string;
  v: string;
  realm: string;
  disabled: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export function createLogsApi(client: ApiClient) {
  return {
    listConfigs() {
      return client.request<LogConfig[]>({
        method: "GET",
        path: "/api/logfile_profiles",
      });
    },

    getConfigById(id: number) {
      return client.request<LogConfig>({
        method: "GET",
        path: `/api/logfile_profiles/${encodeURIComponent(id)}`,
      });
    },

    createConfig(data: { name: string; description?: string }) {
      return client.request<LogConfig>({
        method: "POST",
        path: "/api/logfile_profiles",
        body: data,
      });
    },

    updateConfig(id: number, data: Partial<LogConfig>) {
      return client.request<LogConfig>({
        method: "PUT",
        path: `/api/logfile_profiles/${encodeURIComponent(id)}`,
        body: data,
      });
    },

    deleteConfig(id: number) {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: `/api/logfile_profiles/${encodeURIComponent(id)}`,
      });
    },

    toggleConfig(id: number, disabled: number) {
      return client.request<LogConfig>({
        method: "PUT",
        path: `/api/logfile_profiles/${encodeURIComponent(id)}`,
        body: { disabled: String(disabled) },
      });
    },

    listSettings() {
      return client.request<LogSetting[]>({
        method: "GET",
        path: "/api/logfile_profiles/settings",
      });
    },

    getSettingById(id: number) {
      return client.request<LogSetting>({
        method: "GET",
        path: `/api/logfile_profiles/setting/${encodeURIComponent(id)}`,
      });
    },

    updateSetting(id: number, data: { k?: string; v?: string; action?: string }) {
      return client.request<LogSetting>({
        method: "PUT",
        path: `/api/logfile_profiles/setting/${encodeURIComponent(id)}`,
        body: data,
      });
    },

    createSetting(data: { k: string; v: string; realm: string }) {
      return client.request<LogSetting>({
        method: "POST",
        path: "/api/logfile_profiles/setting",
        body: data,
      });
    },

    deleteSetting(id: number) {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: `/api/logfile_profiles/setting/${encodeURIComponent(id)}`,
      });
    },

    downloadLogs() {
      return client.request<{ url: string }>({
        method: "GET",
        path: "/api/logs/download",
      });
    },

    clearLogs() {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: "/api/logs",
      });
    },

    listParams(profileId: number) {
      return client.request<LogParam[]>({
        method: "GET",
        path: `/api/logfile_profiles/${encodeURIComponent(profileId)}/params`,
      });
    },

    createParam(profileId: number, data: { k: string; v: string }) {
      return client.request<LogParam>({
        method: "POST",
        path: `/api/logfile_profiles/${encodeURIComponent(profileId)}/param`,
        body: data,
      });
    },

    updateParam(profileId: number, paramId: number, data: { k: string; v: string; realm: string }) {
      return client.request<LogParam>({
        method: "PUT",
        path: `/api/logfile_profiles/${encodeURIComponent(profileId)}/params/${encodeURIComponent(paramId)}`,
        body: data,
      });
    },

    deleteParam(profileId: number, paramId: number) {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: `/api/logfile_profiles/${encodeURIComponent(profileId)}/params/${encodeURIComponent(paramId)}`,
      });
    },

    toggleParam(profileId: number, paramId: number, data: { k: string; v: string; realm: string }) {
      return client.request<LogParam>({
        method: "PUT",
        path: `/api/logfile_profiles/${encodeURIComponent(profileId)}/params/${encodeURIComponent(paramId)}`,
        body: { ...data, action: "toggle" },
      });
    },

    listMaps(profileId: number) {
      return client.request<LogMap[]>({
        method: "GET",
        path: `/api/logfile_profiles/${encodeURIComponent(profileId)}/maps`,
      });
    },

    createMap(profileId: number, data: { k: string; v: string }) {
      return client.request<LogMap>({
        method: "POST",
        path: `/api/logfile_profiles/${encodeURIComponent(profileId)}/map`,
        body: data,
      });
    },
  };
}

export type LogsApi = ReturnType<typeof createLogsApi>;
