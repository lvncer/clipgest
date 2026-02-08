import { saveLink } from "./api";
import { getConfig, saveConfig } from "./storage";
import { isAuthenticated, getAuthState, parseJwt } from "./auth";

type OGPData = {
  title: string;
  description: string;
  image: string;
};

const CONTEXT_MENU_ID = "quicklinks-save-link";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Save link to Clipgest.",
    contexts: ["link"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) return;

  const linkUrl = info.linkUrl;
  if (!linkUrl) {
    return;
  }

  try {
    if (!(await isAuthenticated())) {
      if (tab?.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: "CLIPGEST_TOAST",
            message: "Please log in first from the extension options",
            toastType: "error",
          }
        );
      }
      return;
    }

    const linkText = info.selectionText || new URL(linkUrl).hostname;
    const pageUrl = tab?.url || info.pageUrl || "";
    const ogp = await getOGPFromTab(tab?.id);

    await saveLink({
      url: linkUrl,
      title: linkText,
      page: pageUrl,
      description: ogp?.description || "",
      ogImage: ogp?.image || "",
    });

    if (tab?.id) {
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: "CLIPGEST_TOAST",
          message: "link saved!",
          toastType: "success",
        }
      );
    }
  } catch (error) {
    if (tab?.id) {
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: "CLIPGEST_TOAST",
          message:
            error instanceof Error ? error.message : "Failed to save link",
          toastType: "error",
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

  if (message.type === "CLIPGEST_SAVE_AUTH") {
    handleSaveAuthMessage(message)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleSaveLinkMessage(
  message: { url: string; title: string; page: string; note?: string },
  _sender: chrome.runtime.MessageSender,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!(await isAuthenticated())) {
      return {
        success: false,
        error: "Not authenticated. Please log in from the options page.",
      };
    }

    const ogp = await getOGPFromTab(_sender.tab?.id);
    const result = await saveLink({
      url: message.url,
      title: message.title,
      page: message.page,
      note: message.note,
      description: ogp?.description || "",
      ogImage: ogp?.image || "",
    });

    return { success: true, id: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function getOGPFromTab(
  tabId?: number,
): Promise<OGPData | null> {
  if (!tabId) {
    return null;
  }

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tabId,
      { type: "CLIPGEST_GET_OGP" },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        if (!response || response.success !== true) {
          resolve(null);
          return;
        }
        resolve(response.ogp || null);
      },
    );
  });
}

async function handleSaveAuthMessage(message: {
  token: string;
  userId?: string;
  apiBaseUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const token = message.token;

    if (!token) {
      return { success: false, error: "Missing token" };
    }

    const payload = parseJwt(token) as any;

    const userId: string | undefined =
      message.userId || (payload && (payload.sub as string | undefined));

    if (!payload || !userId) {
      return { success: false, error: "Invalid token" };
    }

    const expValue = payload.exp;
    const exp = typeof expValue === "number" ? expValue : undefined;
    const expiresAt = exp ? exp * 1000 : Date.now() + 60 * 60 * 1000;

    const updates: {
      clerkToken: string;
      clerkUserId: string;
      clerkTokenExpiresAt: number;
      apiBaseUrl?: string;
    } = {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
