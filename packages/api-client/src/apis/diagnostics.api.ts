import type { ApiClient } from "../client/types";

export interface PingRequest {
  ip: string;
  port?: string;
  nic?: string;
}

export interface PingResponse {
  code: number;
  data: string;
}

export interface CaptureRequest {
  src_ip?: string;
  dst_ip?: string;
  src_port?: string;
  dst_port?: string;
  proto?: string;
}

export interface StopCaptureRequest {
  pid: string;
}

export interface CaptureResponse {
  code: number;
  message: string;
  data: string;
}

export function createDiagnosticsApi(client: ApiClient) {
  return {
    ping(data: PingRequest) {
      return client.request<PingResponse>({
        method: "POST",
        path: "/api/ping",
        body: data,
      });
    },

    capture(data: CaptureRequest) {
      return client.request<CaptureResponse>({
        method: "POST",
        path: "/api/tcpdump",
        body: data,
      });
    },

    stopCapture(data: StopCaptureRequest) {
      return client.request<CaptureResponse>({
        method: "POST",
        path: "/api/tcpdump",
        body: data,
      });
    },
  };
}

export type DiagnosticsApi = ReturnType<typeof createDiagnosticsApi>;
