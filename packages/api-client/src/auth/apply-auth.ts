export function applyBearerToken(
  headers: Record<string, string> | undefined,
  token: string,
): Record<string, string> {
  return {
    ...headers,
    authorization: `Bearer ${token}`,
  };
}
