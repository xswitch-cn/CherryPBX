import type { ApiClient } from "../client/types";

export type HostInfoResponse = {
  hostname: string;
  ip: string;
  ext_ip?: string;
};

export type SystemStatusResponse = {
  stackSizeKB: {
    current: number;
    max: number;
  };
  idleCPU: {
    used: string;
    allowed: string;
  };
  systemStatus: string;
  uptime: {
    years: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    microseconds: number;
  };
  sessions: {
    count: {
      total: number;
      active: number;
      peak: number;
      peak5Min: number;
      limit: number;
    };
    rate: {
      current: number;
      max: number;
      peak: number;
      peak5Min: number;
      active: number;
    };
  };
  date: string;
  version: number;
};

export type SipStatusResponse = {
  data: {
    register_count: number;
  };
};

export type DashboardStatsResponse = any[];

export type MemoryStatsResponse = any[];

export type DiskStatsResponse = any[];

export type UptimeStatsResponse = any[];

export type ChannelStatsResponse = any[];

export function createDashboardApi(client: ApiClient) {
  return {
    hostInfo() {
      return client.request<HostInfoResponse>({
        method: "GET",
        path: "/status/host_info",
      });
    },

    systemStatus() {
      return client.request<SystemStatusResponse>({
        method: "GET",
        path: "/freeswitch/status",
      });
    },

    sipStatus() {
      return client.request<SipStatusResponse>({
        method: "GET",
        path: "/sip_status",
      });
    },

    freeswitchStats() {
      return client.request<DashboardStatsResponse>({
        method: "GET",
        path: "/freeswitch/stats",
      });
    },

    cpuStats() {
      return client.request<any>({
        method: "GET",
        path: "/status/cpu",
      });
    },

    memoryStats() {
      return client.request<any>({
        method: "GET",
        path: "/status/memory",
      });
    },

    diskStats() {
      return client.request<any>({
        method: "GET",
        path: "/status/disk",
      });
    },

    memoryGraphStats(days?: number) {
      return client.request<any>({
        method: "GET",
        path: "/rrdgraphs/memory",
        query: days ? { days } : undefined,
      });
    },

    diskGraphStats(days?: number) {
      return client.request<any>({
        method: "GET",
        path: "/rrdgraphs/disk",
        query: days ? { days } : undefined,
      });
    },

    uptimeStats() {
      return client.request<UptimeStatsResponse>({
        method: "GET",
        path: "/uptime/stats",
      });
    },

    channelStats() {
      return client.request<ChannelStatsResponse>({
        method: "GET",
        path: "/channel/stats",
      });
    },
  };
}
