import type { ApiErrorCode } from "./error-codes";

export type ApiErrorInit = {
  message: string;
  status?: number;
  code?: ApiErrorCode;
  details?: unknown;
  requestId?: string;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly name = "ApiError";
  readonly status?: number;
  readonly code?: ApiErrorCode;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(init: ApiErrorInit) {
    super(init.message, init.cause ? { cause: init.cause } : undefined);
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.requestId = init.requestId;
  }
}
