import { apiClient } from "@/lib/api-client";
// import { createUsersApi } from "@repo/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { createUsersApi, type ListUsersResponse } from "@/packages/api-client/src/apis/users.api";

const userApi = createUsersApi(apiClient);

export type UserErrorCode =
  | "fetchSuccess"
  | "fetchFailed"
  | "createSuccess"
  | "createFailed"
  | "deleteSuccess"
  | "deleteFailed"
  | "userNotDeletable"
  | "contextFetchSuccess"
  | "contextFetchFailed"
  | "networkError";

export interface UserResult<T = any> {
  success: boolean;
  errorCode?: UserErrorCode;
  data?: T;
  rowCount?: number;
}

export async function list(params: any): Promise<UserResult> {
  try {
    const response = (await userApi.list(params)) as { data: ListUsersResponse };
    const { data } = response;

    return {
      success: true,
      errorCode: "fetchSuccess",
      data: data.data || [],
      rowCount: data.rowCount || 0,
    };
  } catch (error) {
    const isNetworkError = error instanceof TypeError && error.message.includes("fetch");
    return {
      success: false,
      errorCode: isNetworkError ? "networkError" : "fetchFailed",
    };
  }
}

export async function fetchContexts(): Promise<UserResult> {
  try {
    return {
      success: true,
      errorCode: "contextFetchSuccess",
      data: [],
    };
  } catch {
    return {
      success: false,
      errorCode: "networkError",
    };
  }
}

export async function createUser(params: any): Promise<UserResult> {
  try {
    const response = await userApi.create(params);

    return {
      success: true,
      errorCode: "createSuccess",
      data: response,
    };
  } catch (error) {
    const isNetworkError = error instanceof TypeError && error.message.includes("fetch");
    return {
      success: false,
      errorCode: isNetworkError ? "networkError" : "createFailed",
    };
  }
}

export async function deleteUser(id: string | number): Promise<UserResult> {
  try {
    await userApi.delete(id);
    return {
      success: true,
      errorCode: "deleteSuccess",
    };
  } catch {
    return {
      success: false,
      errorCode: "deleteFailed",
    };
  }
}

export function useUserApi() {
  const { token } = useAuthStore();
  return {
    token,
    list,
    fetchContexts,
    createUser,
    deleteUser,
  };
}

export { userApi };
