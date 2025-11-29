import { saveLink } from "./api";
import { getConfig } from "./storage";
import { isAuthenticated, getAuthState, login, logout } from "./auth";

// Context menu ID
const CONTEXT_MENU_ID = "quicklinks-save-link";

// Create context menu on extension install/update
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Save link to QuickLinks",
    contexts: ["link"],
  });
});

// Handle context menu click (PC right-click)
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) return;

  const linkUrl = info.linkUrl;
  if (!linkUrl) {
    console.error("[QuickLinks] No link URL found");
    return;
  }

  try {
    // Check authentication
    if (!(await isAuthenticated())) {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "QUICKLINKS_TOAST",
          message: "Please log in first from the extension options",
          toastType: "error",
        });
      }
      return;
    }

    const pageUrl = tab?.url || info.pageUrl || "";

    // Get link text from selection or use URL
    const linkText = info.selectionText || new URL(linkUrl).hostname;

    await saveLink({
      url: linkUrl,
      title: linkText,
      page: pageUrl,
    });

    // Notify content script to show toast
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "QUICKLINKS_TOAST",
        message: "Link saved!",
        toastType: "success",
      });
    }
  } catch (error) {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "QUICKLINKS_TOAST",
        message: error instanceof Error ? error.message : "Failed to save link",
        toastType: "error",
      });
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_LINK") {
    handleSaveLinkMessage(message, sender)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    // Return true to indicate async response
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

  if (message.type === "LOGIN") {
    login()
      .then((state) => sendResponse({ success: true, state }))
      .catch((error) =>
        sendResponse({ success: false, error: error.message })
      );
    return true;
  }

  if (message.type === "LOGOUT") {
    logout()
      .then(() => sendResponse({ success: true }))
      .catch((error) =>
        sendResponse({ success: false, error: error.message })
      );
    return true;
  }
});

async function handleSaveLinkMessage(
  message: { url: string; title: string; page: string; note?: string },
  _sender: chrome.runtime.MessageSender
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Check authentication
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
