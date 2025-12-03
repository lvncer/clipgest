// src/ui/toast.ts
var TOAST_STYLES = `
  .quicklinks-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    z-index: 2147483647;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: none;
  }

  .quicklinks-toast.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .quicklinks-toast.success {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  .quicklinks-toast.error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  .quicklinks-toast.info {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }
`;
var styleInjected = false;
var currentToast = null;
function injectStyles() {
  if (styleInjected) return;
  const style = document.createElement("style");
  style.textContent = TOAST_STYLES;
  document.head.appendChild(style);
  styleInjected = true;
}
function showToast(message, type = "success", duration = 3e3) {
  injectStyles();
  if (currentToast) {
    currentToast.remove();
  }
  const toast = document.createElement("div");
  toast.className = `quicklinks-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  currentToast = toast;
  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
      if (currentToast === toast) {
        currentToast = null;
      }
    }, 300);
  }, duration);
}

// src/content-script.ts
var LONG_PRESS_DURATION = 500;
var SAVE_BUTTON_TIMEOUT = 5e3;
var longPressTimer = null;
var currentSaveButton = null;
var targetLink = null;
var SAVE_BUTTON_STYLES = `
  .quicklinks-save-btn {
    position: fixed;
    padding: 10px 18px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    border-radius: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    z-index: 2147483646;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
    transform: scale(0.9);
    opacity: 0;
    transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .quicklinks-save-btn.visible {
    transform: scale(1);
    opacity: 1;
  }

  .quicklinks-save-btn:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
  }

  .quicklinks-save-btn:active {
    transform: scale(0.95);
  }

  .quicklinks-save-btn.saving {
    pointer-events: none;
    opacity: 0.7;
  }
`;
var styleInjected2 = false;
function injectStyles2() {
  if (styleInjected2) return;
  const style = document.createElement("style");
  style.textContent = SAVE_BUTTON_STYLES;
  document.head.appendChild(style);
  styleInjected2 = true;
}
function findLinkElement(target) {
  if (!(target instanceof Element)) return null;
  const link = target.closest("a[href]");
  if (link instanceof HTMLAnchorElement && link.href) {
    if (link.href.startsWith("javascript:") || link.href === "#") {
      return null;
    }
    return link;
  }
  return null;
}
function showSaveButton(x, y, link) {
  injectStyles2();
  removeSaveButton();
  const button = document.createElement("button");
  button.className = "quicklinks-save-btn";
  button.textContent = "\u{1F4BE} Save";
  button.setAttribute("data-quicklinks", "save-button");
  const buttonWidth = 100;
  const buttonHeight = 40;
  const padding = 10;
  let left = x - buttonWidth / 2;
  let top = y - buttonHeight - padding;
  left = Math.max(
    padding,
    Math.min(left, window.innerWidth - buttonWidth - padding)
  );
  top = Math.max(
    padding,
    Math.min(top, window.innerHeight - buttonHeight - padding)
  );
  button.style.left = `${left}px`;
  button.style.top = `${top}px`;
  document.body.appendChild(button);
  currentSaveButton = button;
  targetLink = link;
  requestAnimationFrame(() => {
    button.classList.add("visible");
  });
  button.addEventListener("click", handleSaveClick);
  setTimeout(() => {
    if (currentSaveButton === button) {
      removeSaveButton();
    }
  }, SAVE_BUTTON_TIMEOUT);
}
function removeSaveButton() {
  if (currentSaveButton) {
    currentSaveButton.remove();
    currentSaveButton = null;
  }
  targetLink = null;
}
async function handleSaveClick(event) {
  event.preventDefault();
  event.stopPropagation();
  if (!targetLink || !currentSaveButton) return;
  const button = currentSaveButton;
  const link = targetLink;
  button.classList.add("saving");
  button.textContent = "\u23F3 Saving...";
  try {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_LINK",
      url: link.href,
      title: link.textContent?.trim() || link.href,
      page: window.location.href
    });
    if (response.success) {
      showToast("Link saved! \u2728", "success");
    } else {
      showToast(response.error || "Failed to save link", "error");
    }
  } catch (error) {
    console.error("[QuickLinks] Save error:", error);
    showToast("Failed to save link", "error");
  } finally {
    removeSaveButton();
  }
}
function startLongPress(x, y, link) {
  cancelLongPress();
  longPressTimer = setTimeout(() => {
    showSaveButton(x, y, link);
  }, LONG_PRESS_DURATION);
}
function cancelLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}
function handleTouchStart(event) {
  const touch = event.touches[0];
  if (!touch) return;
  const link = findLinkElement(event.target);
  if (link) {
    startLongPress(touch.clientX, touch.clientY, link);
  }
}
function handleTouchEnd() {
  cancelLongPress();
}
function handleTouchMove() {
  cancelLongPress();
}
function handleMouseDown(event) {
  if (event.button !== 0) return;
  const link = findLinkElement(event.target);
  if (link) {
    startLongPress(event.clientX, event.clientY, link);
  }
}
function handleMouseUp() {
  cancelLongPress();
}
function handleMouseMove() {
  cancelLongPress();
}
function handleDocumentClick(event) {
  const target = event.target;
  if (target?.getAttribute?.("data-quicklinks") !== "save-button") {
    removeSaveButton();
  }
}
chrome.runtime.onMessage.addListener((message) => {
  console.log("[QuickLinks] runtime.onMessage", message);
  if (message.type === "QUICKLINKS_TOAST") {
    showToast(message.message, message.toastType || "info");
  }
});
function init() {
  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });
  document.addEventListener("touchmove", handleTouchMove, { passive: true });
  document.addEventListener("touchcancel", handleTouchEnd, { passive: true });
  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("click", handleDocumentClick);
  console.log("[QuickLinks] Content script loaded");
}
init();
