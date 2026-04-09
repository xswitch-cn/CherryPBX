import { apiClient } from "@/lib/api-client";
import { createLiveAuthApi } from "@repo/api-client";
import { useAuthStore, type User } from "@/stores/auth-store";
import type { LoginResponseData, LoginParams } from "@repo/api-client";

const authApi = createLiveAuthApi(apiClient);

function transformUserProfile(profile: LoginResponseData): User {
  return {
    user_id: profile.user_id,
    super_admin: profile.super_admin,
    extn: profile.extn,
    system_roles: {
      senior_roles_str: profile.system_roles.senior_roles_str,
      roles_str: profile.system_roles.roles_str,
    },
    currentAuthority: profile.currentAuthority,
    name: profile.name,
  };
}

export type AuthErrorCode =
  | "loginSuccess"
  | "loginFailed"
  | "networkError"
  | "sessionExpired"
  | "logoutSuccess";

export interface LoginResult {
  success: boolean;
  errorCode?: AuthErrorCode;
  user?: User;
}

export async function login(params: LoginParams): Promise<LoginResult> {
  try {
    const response = await authApi.login(params);
    const { data } = response;

    if (data.code === 200 && data.token) {
      const { token } = data;
      const user = transformUserProfile(data);

      useAuthStore.getState().login(token, user);

      return { success: true, errorCode: "loginSuccess", user };
    }

    return {
      success: false,
      errorCode: "loginFailed",
    };
  } catch (error) {
    const isNetworkError = error instanceof TypeError && error.message.includes("fetch");
    return {
      success: false,
      errorCode: isNetworkError ? "networkError" : "loginFailed",
    };
  }
}

export async function logout() {
  try {
    const response = await authApi.logout();
    const { data } = response;

    if (data.code === 200) {
      useAuthStore.getState().logout();

      return { success: true, errorCode: "logoutSuccess" };
    }

    return {
      success: false,
      errorCode: "logoutFailed",
    };
  } catch (error) {
    const isNetworkError = error instanceof TypeError && error.message.includes("fetch");
    return {
      success: false,
      errorCode: isNetworkError ? "networkError" : "logoutFailed",
    };
  }
}

export function useAuth() {
  const { token, user, isAuthenticated } = useAuthStore();
  return { token, user, isAuthenticated, login, logout };
}

export { authApi };
