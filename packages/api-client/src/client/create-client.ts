import type { ApiClient, ApiClientOptions } from "./types";
import { createAxiosInstance, axiosRequest } from "./axios";

export function createClient(options: ApiClientOptions): ApiClient {
  const axios = options.axios ?? createAxiosInstance(options);

  return {
    request(requestOptions) {
      return axiosRequest(axios, options, requestOptions);
    },
  };
}
