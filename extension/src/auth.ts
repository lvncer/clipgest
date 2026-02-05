import { getConfig, clearAuthData } from "./storage";

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
  expiresAt: number | null;
}

export async function getAuthState(): Promise<AuthState> {
  const config = await getConfig();

  if (!config.clerkToken || !config.clerkUserId) {
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }

  const tokenParts = config.clerkToken.split(".");
  if (tokenParts.length !== 3) {
    await clearAuthData();
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }

  if (config.clerkTokenExpiresAt && Date.now() > config.clerkTokenExpiresAt) {
    await clearAuthData();
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }

  const tokenPayload = parseJwt(config.clerkToken);
  const userId = tokenPayload?.sub as string | undefined;
  if (!tokenPayload || !userId) {
    await clearAuthData();
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }

  return {
    isAuthenticated: true,
    userId: config.clerkUserId,
    token: config.clerkToken,
    expiresAt: config.clerkTokenExpiresAt || null,
  };
}

export async function isAuthenticated(): Promise<boolean> {
  const state = await getAuthState();
  return state.isAuthenticated;
}

export async function getToken(): Promise<string | null> {
  const state = await getAuthState();
  return state.token;
}

export function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
