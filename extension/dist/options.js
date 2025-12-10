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

// src/options.ts
var apiBaseUrlInput = document.getElementById("apiBaseUrl");
var clerkFrontendApiUrlInput = document.getElementById("clerkFrontendApiUrl");
var saveBtn = document.getElementById("saveBtn");
var statusDiv = document.getElementById("status");
var authIcon = document.getElementById("authIcon");
var authTitle = document.getElementById("authTitle");
var authSubtitle = document.getElementById("authSubtitle");
var loggedOutSection = document.getElementById("loggedOutSection");
var loggedInSection = document.getElementById("loggedInSection");
async function loadConfig() {
  const config = await getConfig();
  apiBaseUrlInput.value = config.apiBaseUrl;
  clerkFrontendApiUrlInput.value = config.clerkFrontendApiUrl;
  await updateAuthUI();
}
async function updateAuthUI() {
  const authState = await getAuthState();
  if (authState.isAuthenticated) {
    authIcon.textContent = "\u2705";
    authIcon.className = "auth-status-icon logged-in";
    authTitle.textContent = "\u30ED\u30B0\u30A4\u30F3\u6E08\u307F";
    authSubtitle.textContent = `User ID: ${authState.userId?.slice(0, 16)}...`;
    loggedOutSection.classList.add("hidden");
    loggedInSection.classList.remove("hidden");
  } else {
    authIcon.textContent = "\u274C";
    authIcon.className = "auth-status-icon logged-out";
    authTitle.textContent =
      "\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u3044\u307E\u305B\u3093";
    authSubtitle.textContent =
      "\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u30EA\u30F3\u30AF\u3092\u4FDD\u5B58\u3057\u307E\u3057\u3087\u3046";
    loggedOutSection.classList.remove("hidden");
    loggedInSection.classList.add("hidden");
  }
}
async function handleSave() {
  try {
    await saveConfig({
      apiBaseUrl: apiBaseUrlInput.value.trim() || "http://localhost:8080",
      clerkFrontendApiUrl: clerkFrontendApiUrlInput.value.trim(),
    });
    showStatus("Settings saved successfully! \u2728", "success");
  } catch (error) {
    showStatus(`Failed to save: ${error}`, "error");
  }
}
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  setTimeout(() => {
    statusDiv.className = "status";
  }, 5e3);
}
if (saveBtn) {
  saveBtn.addEventListener("click", handleSave);
}
loadConfig();
