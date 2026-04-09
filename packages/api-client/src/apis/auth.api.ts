import type { ApiClient } from "../client/types";
import type { LoginParams, LoginResponseData, LogoutResponseData } from "../types/auth";

export function createLiveAuthApi(client: ApiClient) {
  return {
    login(params: LoginParams) {
      return client.request<LoginResponseData>({
        method: "POST",
        path: "/api/sessions",
        body: params,
      });
    },
    logout() {
      return client.request<LogoutResponseData>({
        method: "DELETE",
        path: "/api/sessions",
      });
    },
  };
}
