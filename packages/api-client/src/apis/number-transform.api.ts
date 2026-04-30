import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

// 号码变换规则接口
export interface NumberTransform {
  id: number;
  name: string;
  description?: string;
  type: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

// 号码列表项接口
export interface NumberTransformItem {
  id?: number;
  original_number: string;
  nts_number: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

// 号码列表响应接口
export interface NtsNmbers {
  data: NumberTransformItem[];
  rowCount: number;
  pageCount: number;
}

// 详情页响应接口
export interface NtsNmbersInfo {
  nts_numbers: NtsNmbers;
  number_translation_info: NumberTransform[];
}

// 列表查询参数
export type ListNumberTransformsQuery = QueryParams & {
  page?: number;
  page_size?: number;
  language?: string;
  name?: string;
  type?: string;
};

// 响应接口
export interface ListNumberTransformsResponse {
  data: NumberTransform[];
  rowCount: number;
  pageCount: number;
  page: number;
}

export function createNumberTransformApi(client: ApiClient) {
  return {
    list(query?: ListNumberTransformsQuery) {
      return client.request<ListNumberTransformsResponse>({
        method: "GET",
        path: "/api/number_translation",
        query,
      });
    },

    getById(id: number) {
      return client.request<NtsNmbersInfo>({
        method: "GET",
        path: `/api/number_translation/${encodeURIComponent(id)}/numbers`,
      });
    },

    create(data: Omit<NumberTransform, "id">) {
      return client.request<NumberTransform>({
        method: "POST",
        path: "/api/number_translation",
        body: data,
      });
    },

    update(id: number, data: Partial<NumberTransform>) {
      return client.request<NumberTransform>({
        method: "PUT",
        path: `/api/number_translation/${encodeURIComponent(id)}`,
        body: data,
      });
    },

    delete(id: number) {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: `/api/number_translation/${encodeURIComponent(id)}`,
      });
    },

    // 号码列表相关操作
    createNumber(
      ruleId: number,
      data: { id: string; type: string; original_number: string; nts_number: string },
    ) {
      return client.request<NumberTransformItem>({
        method: "POST",
        path: `/api/number_translation/${encodeURIComponent(ruleId)}/numbers`,
        body: data,
      });
    },

    updateNumber(
      ruleId: number,
      numberId: number,
      data: { original_number: string; nts_number: string },
    ) {
      return client.request<NumberTransformItem>({
        method: "PUT",
        path: `/api/number_translation/${encodeURIComponent(ruleId)}/${encodeURIComponent(numberId)}`,
        body: data,
      });
    },

    deleteNumber(ruleId: number, numberId: number) {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: `/api/number_translation/${encodeURIComponent(ruleId)}/${encodeURIComponent(numberId)}`,
      });
    },

    importNumbers(ruleId: number, numbers: { original_number: string; nts_number: string }[]) {
      return client.request<{ success: boolean }>({
        method: "POST",
        path: `/api/number_translation/${encodeURIComponent(ruleId)}/import/`,
        body: numbers,
      });
    },
  };
}

export type NumberTransformsApi = ReturnType<typeof createNumberTransformApi>;
