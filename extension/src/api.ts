import { getConfig } from "./storage";
import { getToken, isAuthenticated } from "./auth";

export interface SaveLinkRequest {
  url: string;
  title: string;
  page: string;
  note?: string;
  tags?: string[];
}

export interface SaveLinkResponse {
  id: string;
}

export interface ApiError {
  error: string;
  detail?: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();

  if (!token) {
    throw new Error("Not authenticated. Please log in first.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function saveLink(
  request: SaveLinkRequest,
): Promise<SaveLinkResponse> {
  const config = await getConfig();

  if (!(await isAuthenticated())) {
    throw new Error("Not authenticated. Please log in from the options page.");
  }

  const headers = await getAuthHeaders();
  const url = `${config.apiBaseUrl}/api/links`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });
  } catch (err) {
    throw new Error("Network error while calling API");
  }

  if (response.status === 401) {
    throw new Error(
      "Session expired. Please log in again from the options page.",
    );
  }

  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.clone().text();
    } catch {
      // ignore
    }

    let errorData: ApiError | null = null;
    try {
      errorData = (await response.json()) as ApiError;
    } catch {
      // JSON でない場合はそのまま status でエラーにする
    }

    throw new Error(
      (errorData && errorData.error) ||
        `HTTP ${response.status} ${response.statusText}`,
    );
  }

  try {
    const data = (await response.json()) as SaveLinkResponse;
    return data;
  } catch (err) {
    throw new Error("Invalid JSON response from API");
  }
}
