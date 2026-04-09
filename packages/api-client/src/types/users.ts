export type User = {
  id: string;
  login: string;
  name?: string | null;
  type?: string;
  domain?: string;
  last_login_at?: string;
  createdAt?: string;
  updatedAt?: string;
  tel?: string;
  is_super?: number;
  disabled?: number;
  context?: string;
  default_extension_id?: string | null;
  extn_id?: string | null;
};
