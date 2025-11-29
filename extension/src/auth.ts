import { getConfig, saveConfig, clearAuthData } from "./storage";

// Clerk OAuth configuration
// These will be set via options page
const CLERK_FRONTEND_API_URL_KEY = "clerkFrontendApiUrl";

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
  expiresAt: number | null;
}

/**
 * Get current authentication state
 */
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

  // Check if token is expired
  if (config.clerkTokenExpiresAt && Date.now() > config.clerkTokenExpiresAt) {
    // Token expired, clear auth data
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

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const state = await getAuthState();
  return state.isAuthenticated;
}

/**
 * Get the current auth token
 */
export async function getToken(): Promise<string | null> {
  const state = await getAuthState();
  return state.token;
}

/**
 * Start the Clerk OAuth login flow using chrome.identity.launchWebAuthFlow
 */
export async function login(): Promise<AuthState> {
  const config = await getConfig();

  if (!config.clerkFrontendApiUrl) {
    throw new Error(
      "Clerk Frontend API URL not configured. Please set it in the options page."
    );
  }

  // Get the redirect URL for the extension
  const redirectUrl = chrome.identity.getRedirectURL();

  // Build Clerk OAuth URL
  // Clerk uses their hosted sign-in page which redirects back with a session token
  const authUrl = new URL(`${config.clerkFrontendApiUrl}/oauth/authorize`);
  authUrl.searchParams.set("redirect_uri", redirectUrl);
  authUrl.searchParams.set("response_type", "code");

  try {
    // Launch the auth flow
    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: true,
    });

    if (!responseUrl) {
      throw new Error("Authentication was cancelled");
    }

    // Parse the response URL to extract the token
    const url = new URL(responseUrl);
    const code = url.searchParams.get("code");
    const token = url.searchParams.get("token");
    const sessionToken = url.hash
      ? new URLSearchParams(url.hash.substring(1)).get("session_token")
      : null;

    // Try different token sources
    const authToken = token || sessionToken || code;

    if (!authToken) {
      throw new Error("No authentication token received");
    }

    // Exchange code for session token if needed, or use the token directly
    // For simplicity, we'll store the token directly
    // In production, you might need to exchange the code for a proper JWT

    // Decode the JWT to get user info (basic parsing)
    const tokenPayload = parseJwt(authToken);

    if (!tokenPayload || !tokenPayload.sub) {
      throw new Error("Invalid token received");
    }

    // Calculate expiration (default to 1 hour if not specified)
    const expiresAt = tokenPayload.exp
      ? tokenPayload.exp * 1000
      : Date.now() + 60 * 60 * 1000;

    // Save the auth data
    await saveConfig({
      clerkToken: authToken,
      clerkUserId: tokenPayload.sub,
      clerkTokenExpiresAt: expiresAt,
    });

    return {
      isAuthenticated: true,
      userId: tokenPayload.sub,
      token: authToken,
      expiresAt,
    };
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

/**
 * Logout - clear auth data
 */
export async function logout(): Promise<void> {
  await clearAuthData();
}

/**
 * Parse a JWT token without validation (for client-side use only)
 */
function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Refresh token if needed (for future implementation)
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  const config = await getConfig();

  if (!config.clerkToken || !config.clerkTokenExpiresAt) {
    return false;
  }

  // Check if token expires within 5 minutes
  const fiveMinutes = 5 * 60 * 1000;
  if (Date.now() + fiveMinutes < config.clerkTokenExpiresAt) {
    // Token is still valid
    return true;
  }

  // Token is about to expire or already expired
  // For now, we just return false and let the user re-login
  // In a production app, you might implement token refresh here
  return false;
}
