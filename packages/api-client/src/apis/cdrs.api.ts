import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";
import type { Cdr } from "../types/cdrs";

export type ListCdrsQuery = QueryParams & {
  page?: number;
  perPage?: number;
  startDate?: string;
  endDate?: string;
  cidNumber?: string;
  destNumber?: string;
  uuid?: string;
  startBillsec?: string;
  endBillsec?: string;
  contextValue?: string;
  groupValue?: string;
  routeID?: string;
  q?: string;
};

export interface ListCdrsResponse {
  data: Cdr[];
  page: number;
  pageCount: number;
  rowCount: number;
}

export interface RelatedCdr {
  uuid: string;
  type: string;
}

export interface MediaFile {
  id: string;
  name: string;
  mime?: string;
  ext?: string;
}

export function createCdrsApi(client: ApiClient) {
  return {
    me() {
      return client.request<Cdr>({
        method: "GET",
        path: "/cdrs/me",
      });
    },

    list(query?: ListCdrsQuery) {
      return client.request<ListCdrsResponse>({
        method: "GET",
        path: "/cdrs",
        query,
      });
    },

    getById(id: string) {
      return client.request<Cdr>({
        method: "GET",
        path: `/cdrs/${encodeURIComponent(id)}`,
      });
    },

    getRelatedCdrs(id: string) {
      return client.request<RelatedCdr[]>({
        method: "GET",
        path: `/cdrs/${encodeURIComponent(id)}/related_cdrs`,
      });
    },

    getMediaFiles(uuid: string) {
      return client.request<MediaFile[]>({
        method: "GET",
        path: "/media_files",
        query: { uuid },
      });
    },
  };
}
