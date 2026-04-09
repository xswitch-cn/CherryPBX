import type { ApiClient } from "../client/types";
import type { QueryParams } from "../types/common";
import type { User } from "../types/users";

export type ListUsersQuery = QueryParams & {
  page?: number;
  perPage?: number;
  hpack?: boolean;
  login?: string;
  name?: string;
  type?: string;
};

export type ListUsersResponse = {
  data: User[];
  rowCount: number;
  code?: number;
};

export interface UsersApi {
  me(): ReturnType<ApiClient["request"]>;
  list(query?: ListUsersQuery): ReturnType<ApiClient["request"]>;
  getById(id: string): ReturnType<ApiClient["request"]>;
  create(data: any): ReturnType<ApiClient["request"]>;
  update(id: string, data: any): ReturnType<ApiClient["request"]>;
  delete(id: number | string): ReturnType<ApiClient["request"]>;
  batchUpdate(data: any): ReturnType<ApiClient["request"]>;
  download(data: any): ReturnType<ApiClient["request"]>;
  upload(data: any): ReturnType<ApiClient["request"]>;
  contexts(): ReturnType<ApiClient["request"]>;
  getExtensions(
    userId: string,
    query?: { page?: number; limit?: number },
  ): ReturnType<ApiClient["request"]>;
  createExtension(userId: string, data: any): ReturnType<ApiClient["request"]>;
  setDefaultExtension(
    userId: string,
    extensionId: string,
    data: { is_default: number },
  ): ReturnType<ApiClient["request"]>;
  removeExtension(userId: string, extensionId: string): ReturnType<ApiClient["request"]>;
  getUserGroups(userId: string): ReturnType<ApiClient["request"]>;
  removeUserGroup(userId: string, groupId: string): ReturnType<ApiClient["request"]>;
}

export function createUsersApi(client: ApiClient): UsersApi {
  return {
    me() {
      return client.request<User>({
        method: "GET",
        path: "/users/me",
      });
    },

    list(query?: ListUsersQuery) {
      // 添加一个随机参数，确保每次请求都不使用缓存
      const queryWithCacheBuster = {
        ...query,
        _t: Date.now().toString(),
      };
      return client.request<ListUsersResponse>({
        method: "GET",
        path: "/api/users",
        query: queryWithCacheBuster,
      });
    },

    getById(id: string) {
      return client.request<User>({
        method: "GET",
        path: `/api/users/${encodeURIComponent(id)}`,
      });
    },

    create(data: any) {
      return client.request({
        method: "POST",
        path: "/api/users",
        body: data,
      });
    },

    update(id: string, data: any) {
      return client.request({
        method: "PUT",
        path: `/api/users/${id}`,
        body: data,
      });
    },

    delete(id: number | string) {
      return client.request({
        method: "DELETE",
        path: `/api/users/${id}`,
      });
    },

    batchUpdate(data: any) {
      return client.request({
        method: "PUT",
        path: "/api/users/",
        body: data,
      });
    },

    download(data: any) {
      return client.request({
        method: "GET",
        path: "/api/users/download",
        query: data,
      });
    },

    upload(data: any) {
      return client.request({
        method: "POST",
        path: "/api/users/import",
        body: data,
      });
    },

    contexts() {
      return client.request({
        method: "GET",
        path: "/api/contexts",
      });
    },

    getExtensions(userId: string, _query?: { page?: number; limit?: number }) {
      return client.request({
        method: "GET",
        path: `/api/users/${userId}/extensions`,
      });
    },

    createExtension(userId: string, data: any) {
      return client.request({
        method: "POST",
        path: "/api/extensions",
        body: { ...data, user_id: userId },
      });
    },

    setDefaultExtension(userId: string, extensionId: string, _data: { is_default: number }) {
      return client.request({
        method: "PUT",
        path: `/api/users/${userId}`,
        body: { action: "toggle", extn_id: extensionId },
      });
    },

    removeExtension(userId: string, extensionId: string) {
      return client.request({
        method: "POST",
        path: `/api/users/${userId}/extns/leave`,
        body: { extn_id: extensionId },
      });
    },

    getUserGroups(userId: string) {
      return client.request({
        method: "GET",
        path: `/api/user_groups/${userId}`,
      });
    },

    removeUserGroup(userId: string, groupId: string) {
      return client.request({
        method: "DELETE",
        path: `/api/groups/members/${groupId}/${userId}`,
      });
    },
  };
}
