export function getTokenExpiration(token?: string): number | undefined {
  if (!token) {
    return undefined;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts.some((part) => !part)) {
      return undefined;
    }

    const payload: unknown = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (
      typeof payload !== "object" || payload === null ||
      !("exp" in payload) || typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp)
    ) {
      return undefined;
    }

    const expiration = payload.exp * 1000;
    return Number.isFinite(expiration) ? expiration : undefined;
  } catch {
    return undefined;
  }
}

export function isTokenExpired(token?: string): boolean {
  const expiration = getTokenExpiration(token);
  return expiration === undefined || Date.now() >= expiration;
}
