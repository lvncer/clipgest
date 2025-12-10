// src/storage.ts
var DEFAULT_CONFIG = {
  apiBaseUrl: "https://quicklinks-hftb.onrender.com",
  clerkFrontendApiUrl: "",
  clerkToken: "",
  clerkUserId: "",
  clerkTokenExpiresAt: 0,
};
async function getConfig() {
  const result = await chrome.storage.sync.get(DEFAULT_CONFIG);
  return {
    apiBaseUrl: result.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl,
    clerkFrontendApiUrl:
      result.clerkFrontendApiUrl || DEFAULT_CONFIG.clerkFrontendApiUrl,
    clerkToken: result.clerkToken || DEFAULT_CONFIG.clerkToken,
    clerkUserId: result.clerkUserId || DEFAULT_CONFIG.clerkUserId,
    clerkTokenExpiresAt:
      result.clerkTokenExpiresAt || DEFAULT_CONFIG.clerkTokenExpiresAt,
  };
}
async function saveConfig(config) {
  await chrome.storage.sync.set(config);
}
async function clearAuthData() {
  await chrome.storage.sync.remove([
    "clerkToken",
    "clerkUserId",
    "clerkTokenExpiresAt",
  ]);
}

// src/auth.ts
async function getAuthState() {
  const config = await getConfig();
  console.log("[QuickLinks] getAuthState - config:", {
    hasToken: !!config.clerkToken,
    hasUserId: !!config.clerkUserId,
    tokenLength: config.clerkToken?.length || 0,
    expiresAt: config.clerkTokenExpiresAt,
    now: Date.now(),
  });
  if (!config.clerkToken || !config.clerkUserId) {
    console.log("[QuickLinks] getAuthState - No token or user ID");
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }
  const tokenParts = config.clerkToken.split(".");
  if (tokenParts.length !== 3) {
    console.warn(
      "[QuickLinks] getAuthState - Invalid token format, clearing auth",
    );
    await clearAuthData();
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }
  if (config.clerkTokenExpiresAt && Date.now() > config.clerkTokenExpiresAt) {
    console.log("[QuickLinks] getAuthState - Token expired, clearing auth", {
      expiresAt: config.clerkTokenExpiresAt,
      now: Date.now(),
      diffMs: config.clerkTokenExpiresAt - Date.now(),
    });
    await clearAuthData();
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }
  const tokenPayload = parseJwt(config.clerkToken);
  const userId = tokenPayload?.sub;
  if (!tokenPayload || !userId) {
    console.warn(
      "[QuickLinks] getAuthState - Invalid token payload, clearing auth",
    );
    await clearAuthData();
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }
  console.log("[QuickLinks] getAuthState - Authenticated:", {
    userId: config.clerkUserId,
    tokenSub: userId,
    matches: config.clerkUserId === userId,
  });
  return {
    isAuthenticated: true,
    userId: config.clerkUserId,
    token: config.clerkToken,
    expiresAt: config.clerkTokenExpiresAt || null,
  };
}
async function isAuthenticated() {
  const state = await getAuthState();
  return state.isAuthenticated;
}
async function getToken() {
  const state = await getAuthState();
  return state.token;
}
function parseJwt(token) {
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

// src/api.ts
async function getAuthHeaders() {
  const token = await getToken();
  if (!token) {
    throw new Error("Not authenticated. Please log in first.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
async function saveLink(request) {
  const config = await getConfig();
  if (!(await isAuthenticated())) {
    throw new Error("Not authenticated. Please log in from the options page.");
  }
  const headers = await getAuthHeaders();
  const url = `${config.apiBaseUrl}/api/links`;
  console.log("[QuickLinks] saveLink: POST", url, {
    hasToken: !!headers.Authorization,
  });
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });
  } catch (err) {
    console.error("[QuickLinks] saveLink: fetch failed", err);
    throw new Error("Network error while calling API");
  }
  console.log(
    "[QuickLinks] saveLink: response",
    response.status,
    response.statusText,
  );
  if (response.status === 401) {
    throw new Error(
      "Session expired. Please log in again from the options page.",
    );
  }
  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.clone().text();
    } catch {}
    console.error("[QuickLinks] saveLink: API error body", {
      status: response.status,
      statusText: response.statusText,
      bodyPreview: bodyText.slice(0, 300),
    });
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {}
    throw new Error(
      (errorData && errorData.error) ||
        `HTTP ${response.status} ${response.statusText}`,
    );
  }
  try {
    const data = await response.json();
    console.log("[QuickLinks] saveLink: success", { id: data.id });
    return data;
  } catch (err) {
    console.error("[QuickLinks] saveLink: failed to parse JSON", err);
    throw new Error("Invalid JSON response from API");
  }
}

// src/background.ts
var CONTEXT_MENU_ID = "quicklinks-save-link";
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Save link to QuickLinks",
    contexts: ["link"],
  });
});
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("[QuickLinks] contextMenus.onClicked", {
    info,
    tabId: tab?.id,
  });
  if (info.menuItemId !== CONTEXT_MENU_ID) return;
  const linkUrl = info.linkUrl;
  if (!linkUrl) {
    console.error("[QuickLinks] No link URL found");
    return;
  }
  try {
    if (!(await isAuthenticated())) {
      console.log("[QuickLinks] Context menu clicked but not authenticated");
      if (tab?.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: "QUICKLINKS_TOAST",
            message: "Please log in first from the extension options",
            toastType: "error",
          },
          () => {
            const err = chrome.runtime.lastError;
            if (err) {
              console.warn(
                "[QuickLinks] Failed to send not-authenticated toast:",
                err.message,
              );
            }
          },
        );
      }
      return;
    }
    const pageUrl = tab?.url || info.pageUrl || "";
    const linkText = info.selectionText || new URL(linkUrl).hostname;
    await saveLink({
      url: linkUrl,
      title: linkText,
      page: pageUrl,
    });
    if (tab?.id) {
      console.log("[QuickLinks] Sending success toast to tab", tab.id);
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: "QUICKLINKS_TOAST",
          message: "Link saved!",
          toastType: "success",
        },
        () => {
          const err = chrome.runtime.lastError;
          if (err) {
            console.warn(
              "[QuickLinks] Failed to send success toast:",
              err.message,
            );
          }
        },
      );
    }
  } catch (error) {
    console.error("[QuickLinks] Error while saving from context menu", error);
    if (tab?.id) {
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: "QUICKLINKS_TOAST",
          message:
            error instanceof Error ? error.message : "Failed to save link",
          toastType: "error",
        },
        () => {
          const err = chrome.runtime.lastError;
          if (err) {
            console.warn(
              "[QuickLinks] Failed to send error toast:",
              err.message,
            );
          }
        },
      );
    }
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_LINK") {
    handleSaveLinkMessage(message, sender)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
  if (message.type === "GET_CONFIG") {
    getConfig().then(sendResponse);
    return true;
  }
  if (message.type === "CHECK_AUTH") {
    getAuthState().then(sendResponse);
    return true;
  }
  if (message.type === "QUICKLINKS_SAVE_AUTH") {
    handleSaveAuthMessage(message)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
async function handleSaveLinkMessage(message, _sender) {
  try {
    if (!(await isAuthenticated())) {
      return {
        success: false,
        error: "Not authenticated. Please log in from the options page.",
      };
    }
    const result = await saveLink({
      url: message.url,
      title: message.title,
      page: message.page,
      note: message.note,
    });
    return { success: true, id: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
async function handleSaveAuthMessage(message) {
  try {
    const token = message.token;
    if (!token) {
      return { success: false, error: "Missing token" };
    }
    const payload = parseJwt(token);
    const userId = message.userId || (payload && payload.sub);
    if (!payload || !userId) {
      return { success: false, error: "Invalid token" };
    }
    const expValue = payload.exp;
    const exp = typeof expValue === "number" ? expValue : void 0;
    const expiresAt = exp ? exp * 1e3 : Date.now() + 60 * 60 * 1e3;
    console.log("[QuickLinks] handleSaveAuthMessage - parsed token", {
      userId,
      payload,
      exp,
      expiresAt,
      now: Date.now(),
    });
    const updates = {
      clerkToken: token,
      clerkUserId: userId,
      clerkTokenExpiresAt: expiresAt,
    };
    const apiBaseUrl = message.apiBaseUrl;
    if (typeof apiBaseUrl === "string") {
      const trimmed = apiBaseUrl.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        updates.apiBaseUrl = trimmed.replace(/\/+$/, "");
      }
    }
    await saveConfig(updates);
    return { success: true };
  } catch (error) {
    console.error("[QuickLinks] Failed to save auth from Web:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
