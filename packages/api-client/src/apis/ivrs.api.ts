import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export type ListIvrsQuery = QueryParams & {
  page?: number;
  perPage?: number;
};

export type IVR = {
  id: number;
  name: string;
  description: string;
  identifier: string;
  greet_long?: string;
  greet_short?: string;
  count_actions?: number;
  digit_len?: number;
  invalid_sound?: string;
  exit_sound?: string;
  transfer_sound?: string;
  greet_long_name?: string;
  greet_long_url?: string;
  greet_short_name?: string;
  greet_short_url?: string;
  invalid_sound_name?: string;
  invalid_sound_url?: string;
  exit_sound_name?: string;
  exit_sound_url?: string;
  transfer_sound_name?: string;
  transfer_sound_url?: string;
  max_failures?: number;
  max_timeouts?: number;
  exec_on_max_failures?: string;
  exec_on_max_timeouts?: string;
  confirm_macro?: string;
  confirm_key?: string;
  tts_engine?: string;
  tts_voice?: string;
  confirm_attempts?: number;
  inter_digit_timeout?: number;
  timeout?: number;
  pin?: string;
  pin_file?: string;
  pin_file_name?: string;
  pin_file_url?: string;
  bad_pin_file?: string;
  bad_pin_file_name?: string;
  bad_pin_file_url?: string;
};

export type ListIvrsResponse = {
  data: IVR[];
  rowCount: number;
  page: number;
  code?: number;
};

export interface IvrsApi {
  list(query?: ListIvrsQuery): ReturnType<ApiClient["request"]>;
  get(id: number | string): ReturnType<ApiClient["request"]>;
  create(data: any): ReturnType<ApiClient["request"]>;
  update(id: number | string, data: any): ReturnType<ApiClient["request"]>;
  delete(id: number | string): ReturnType<ApiClient["request"]>;
  getActions(ivrId: number): ReturnType<ApiClient["request"]>;
  deleteAction(ivrId: number, actionId: number): ReturnType<ApiClient["request"]>;
  getRoutes(ivrId: number): ReturnType<ApiClient["request"]>;
}

export function createIvrsApi(client: ApiClient): IvrsApi {
  return {
    list(query?: ListIvrsQuery) {
      return client.request<ListIvrsResponse>({
        method: "GET",
        path: "/api/ivrs",
        query: query,
      });
    },

    get(id: number | string) {
      return client.request<IVR>({
        method: "GET",
        path: `/api/ivrs/${id}`,
      });
    },

    create(data: any) {
      return client.request({
        method: "POST",
        path: "/api/ivrs",
        body: data,
      });
    },

    update(id: number | string, data: any) {
      return client.request({
        method: "PUT",
        path: `/api/ivrs/${id}`,
        body: data,
      });
    },

    delete(id: number | string) {
      return client.request({
        method: "DELETE",
        path: `/api/ivrs/${id}`,
      });
    },

    getActions(ivrId: number) {
      return client.request({
        method: "GET",
        path: `/api/ivrs/${ivrId}/actions`,
      });
    },

    deleteAction(ivrId: number, actionId: number) {
      return client.request({
        method: "DELETE",
        path: `/api/ivrs/${ivrId}/actions/${actionId}`,
      });
    },

    getRoutes(ivrId: number) {
      return client.request({
        method: "GET",
        path: `/api/ivrs/${ivrId}/routes`,
      });
    },
  };
}
