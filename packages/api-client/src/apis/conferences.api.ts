import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";

export type ListConferencesQuery = QueryParams & {
  page?: number;
  perPage?: number;
};

export type Conference = {
  id: number;
  name: string;
  description: string;
  nbr: string;
  realm: string;
  capacity: number;
  banner?: any;
  enable_agora?: boolean;
  canvas_count?: string;
  bandwidth?: string;
  fps?: string;
  cluster?: any;
  moderator?: number;
  video_mode?: string;
  profile_id?: string;
  call_permission?: string;
  call_perm?: string;
  pin?: string;
  admin_pin?: string;
  agora_appid?: string;
  agora_token?: string;
  agora_channel?: string;
};

export type ConferenceProfile = {
  id: number;
  name: string;
  description?: string;
};

export type DictItem = {
  id: number;
  name: string;
  value: string;
};

export type UserItem = {
  id: number;
  extn: string;
  name: string;
};

export type MediaFile = {
  id: number;
  name: string;
};

export type ListConferencesResponse = {
  data: Conference[];
  rowCount: number;
  page: number;
  code?: number;
};

export interface ConferencesApi {
  list(query?: ListConferencesQuery): ReturnType<ApiClient["request"]>;
  get(id: number | string): ReturnType<ApiClient["request"]>;
  create(data: any): ReturnType<ApiClient["request"]>;
  update(id: number | string, data: any): ReturnType<ApiClient["request"]>;
  delete(id: number | string): ReturnType<ApiClient["request"]>;
  getForceDomain(): ReturnType<ApiClient["request"]>;
  getProfiles(): ReturnType<ApiClient["request"]>;
  getVideoModes(): ReturnType<ApiClient["request"]>;
  getCallPermissions(): ReturnType<ApiClient["request"]>;
  getUsers(): ReturnType<ApiClient["request"]>;
  getMediaFiles(id: number | string): ReturnType<ApiClient["request"]>;
  getGroups(): ReturnType<ApiClient["request"]>;
  getGroupMembers(
    roomId: number | string,
    groupId: number | string,
  ): ReturnType<ApiClient["request"]>;
  addMembers(roomId: number | string, data: any): ReturnType<ApiClient["request"]>;
  addGroupMembers(roomId: number | string, data: any): ReturnType<ApiClient["request"]>;
  addMedia(roomId: number | string, data: any): ReturnType<ApiClient["request"]>;
  getMediaFilesList(types: string): ReturnType<ApiClient["request"]>;
  getMembers(roomId: number | string): ReturnType<ApiClient["request"]>;
  setModerator(
    roomId: number | string,
    memberId: number | string,
  ): ReturnType<ApiClient["request"]>;
  deleteMember(
    roomId: number | string,
    memberId: number | string,
  ): ReturnType<ApiClient["request"]>;
  deleteMedia(roomId: number | string, mediaId: number | string): ReturnType<ApiClient["request"]>;
}

export function createConferencesApi(client: ApiClient): ConferencesApi {
  return {
    list(query?: ListConferencesQuery) {
      return client.request<ListConferencesResponse>({
        method: "GET",
        path: "/api/conference_rooms",
        query: query,
      });
    },

    get(id: number | string) {
      return client.request<Conference>({
        method: "GET",
        path: `/api/conference_rooms/${id}`,
      });
    },

    create(data: any) {
      return client.request({
        method: "POST",
        path: "/api/conference_rooms",
        body: data,
      });
    },

    update(id: number | string, data: any) {
      return client.request({
        method: "PUT",
        path: `/api/conference_rooms/${id}`,
        body: data,
      });
    },

    delete(id: number | string) {
      return client.request({
        method: "DELETE",
        path: `/api/conference_rooms/${id}`,
      });
    },

    getForceDomain() {
      return client.request({
        method: "GET",
        path: "/api/users/force_domain/default",
      });
    },

    getProfiles() {
      return client.request<ConferenceProfile[]>({
        method: "GET",
        path: "/api/conference_profiles",
      });
    },

    getVideoModes() {
      return client.request<DictItem[]>({
        method: "GET",
        path: "/api/dicts?realm=CONF_VIDEO_MODE",
      });
    },

    getCallPermissions() {
      return client.request<DictItem[]>({
        method: "GET",
        path: "/api/dicts?realm=CONF_CALL_PERM",
      });
    },

    getUsers() {
      return client.request<UserItem[]>({
        method: "GET",
        path: "/api/conference_rooms/select/users",
      });
    },

    getMediaFiles(id: number | string) {
      return client.request<MediaFile[]>({
        method: "GET",
        path: `/api/conference_rooms/${id}/media_files`,
      });
    },

    getGroups() {
      return client.request({
        method: "GET",
        path: "/api/groups/user_group",
      });
    },

    getGroupMembers(roomId: number | string, groupId: number | string) {
      return client.request({
        method: "GET",
        path: `/api/conference_rooms/${roomId}/remain_members/${groupId}`,
      });
    },

    addMembers(roomId: number | string, data: any) {
      return client.request({
        method: "POST",
        path: `/api/conference_rooms/${roomId}/members`,
        body: data,
      });
    },

    addGroupMembers(roomId: number | string, data: any) {
      return client.request({
        method: "POST",
        path: `/api/conference_rooms/${roomId}/members`,
        body: data,
      });
    },

    addMedia(roomId: number | string, data: any) {
      return client.request({
        method: "POST",
        path: `/api/conference_rooms/${roomId}/medias`,
        body: data,
      });
    },

    getMediaFilesList(types: string) {
      return client.request({
        method: "GET",
        path: `/api/media_files`,
        query: { types },
      });
    },

    getMembers(roomId: number | string) {
      return client.request({
        method: "GET",
        path: `/api/conference_rooms/${roomId}/members`,
      });
    },

    setModerator(roomId: number | string, memberId: number | string) {
      return client.request({
        method: "PUT",
        path: `/api/conference_rooms/moderator/${roomId}/${memberId}`,
      });
    },

    deleteMember(roomId: number | string, memberId: number | string) {
      return client.request({
        method: "DELETE",
        path: `/api/conference_rooms/${roomId}/members/${memberId}`,
      });
    },

    deleteMedia(roomId: number | string, mediaId: number | string) {
      return client.request({
        method: "DELETE",
        path: `/api/conference_rooms/${roomId}/media_files/${mediaId}`,
      });
    },
  };
}
