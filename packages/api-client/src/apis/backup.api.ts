import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export interface SchemaItem {
  id: number;
  name: string;
}

export interface BackupSchemaRequest extends QueryParams {
  cdr_backup?: boolean;
}

export interface SwitchSchemaRequest {
  schema_name: string;
}

export interface BackupResponse {
  code: number;
  message: string;
}

export function createBackupApi(client: ApiClient) {
  return {
    getSchemas() {
      return client.request<string[]>({
        method: "GET",
        path: "/api/system/schema",
      });
    },

    backupSchema(params: BackupSchemaRequest) {
      return client.request<BackupResponse>({
        method: "GET",
        path: "/api/system/backup_schema",
        query: params,
      });
    },

    switchSchema(data: SwitchSchemaRequest) {
      return client.request<BackupResponse>({
        method: "POST",
        path: "/api/system/switch_schema",
        body: data,
      });
    },
  };
}

export type BackupApi = ReturnType<typeof createBackupApi>;
