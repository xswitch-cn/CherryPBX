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

    getById(id: number) {
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

    update(id: number, data: Partial<MediaFile>) {
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
  };
}
