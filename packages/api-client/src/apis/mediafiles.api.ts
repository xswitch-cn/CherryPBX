import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export interface MediaFile {
  id: number;
  name: string;
  description?: string;
  type?: string;
  file_size?: number;
  abs_path?: string;
  rel_path?: string;
  ext?: string;
  k?: string;
  v?: string;
  isSelectedMediaFile?: boolean;
  original_file_name?: string;
  domain?: string;
  file_name?: string;
  channel_uuid?: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
  processing_flag?: number;
  meta?: string;
  dir_path?: string;
  mime?: string;
  geo_position?: string;
  thumb_path?: string;
}

export type ListMediaFilesQuery = QueryParams & {
  types?: string;
  page?: number;
  page_size?: number;
  hpack?: boolean;
};

export interface ListMediaFilesResponse {
  data: MediaFile[];
  page: number;
  pageCount: number;
  rowCount: number;
  hpack: boolean;
}

export function createMediaFilesApi(client: ApiClient) {
  return {
    list(query?: ListMediaFilesQuery) {
      return client.request<ListMediaFilesResponse>({
        method: "GET",
        path: "/api/media_files",
        query,
      });
    },

    getById(id: string) {
      return client.request<MediaFile>({
        method: "GET",
        path: `/api/media_files/${encodeURIComponent(id)}`,
      });
    },

    create(data: Partial<MediaFile>) {
      return client.request<MediaFile>({
        method: "POST",
        path: "/api/media_files",
        body: data,
      });
    },

    update(id: string, data: Partial<MediaFile>) {
      return client.request<MediaFile>({
        method: "PUT",
        path: `/api/media_files/${encodeURIComponent(id)}`,
        body: data,
      });
    },

    delete(id: number) {
      return client.request<{ success: boolean }>({
        method: "DELETE",
        path: `/api/media_files/${encodeURIComponent(id)}`,
      });
    },

    addTts(data: { engine: string; input: string }) {
      return client.request<MediaFile>({
        method: "POST",
        path: `/api/${data.engine}/tts`,
        body: data,
      });
    },

    /**
     * 上传媒体文件
     */
    upload(formData: FormData) {
      return client.request<any>({
        method: "POST",
        path: "/api/upload",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  };
}
