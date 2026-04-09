export type ResponseBase<T> = {
  code: number;
  message: string;
  data: T;
};

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponseData {
  user_id: number;
  super_admin: number;
  code: number;
  extn: string;
  token: string;
  system_roles: {
    senior_roles_str: string;
    roles_str: string;
  };
  expires: number;
  currentAuthority: string;
  name: string;
}

export interface LogoutResponseData {
  code: number;
  text: string;
}

export type LoginResponse = ResponseBase<LoginResponseData>;
