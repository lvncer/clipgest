import { showToast } from "./ui/toast";

const LONG_PRESS_DURATION = 500;
const SAVE_BUTTON_TIMEOUT = 5000;

let longPressTimer: ReturnType<typeof setTimeout> | null = null;
let currentSaveButton: HTMLElement | null = null;
let targetLink: HTMLAnchorElement | null = null;

const SAVE_BUTTON_STYLES = `
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

let styleInjected = false;

function injectStyles(): void {
  if (styleInjected) return;

  const style = document.createElement("style");
  style.textContent = SAVE_BUTTON_STYLES;
  document.head.appendChild(style);
  styleInjected = true;
}

function findLinkElement(target: EventTarget | null): HTMLAnchorElement | null {
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

function showSaveButton(x: number, y: number, link: HTMLAnchorElement): void {
  injectStyles();
  removeSaveButton();

  const button = document.createElement("button");
  button.className = "quicklinks-save-btn";
  button.textContent = "💾 Save";
  button.setAttribute("data-quicklinks", "save-button");

  const buttonWidth = 100;
  const buttonHeight = 40;
  const padding = 10;

  let left = x - buttonWidth / 2;
  let top = y - buttonHeight - padding;

  left = Math.max(
    padding,
    Math.min(left, window.innerWidth - buttonWidth - padding),
  );
  top = Math.max(
    padding,
    Math.min(top, window.innerHeight - buttonHeight - padding),
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

function removeSaveButton(): void {
  if (currentSaveButton) {
    currentSaveButton.remove();
    currentSaveButton = null;
  }
  targetLink = null;
}

async function handleSaveClick(event: Event): Promise<void> {
  event.preventDefault();
  event.stopPropagation();

  if (!targetLink || !currentSaveButton) return;

  const button = currentSaveButton;
  const link = targetLink;

  button.classList.add("saving");
  button.textContent = "⏳ Saving...";

  try {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_LINK",
      url: link.href,
      title: link.textContent?.trim() || link.href,
      page: window.location.href,
    });

    if (response.success) {
      showToast("Link saved! ✨", "success");
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

function startLongPress(x: number, y: number, link: HTMLAnchorElement): void {
  cancelLongPress();

  longPressTimer = setTimeout(() => {
    showSaveButton(x, y, link);
  }, LONG_PRESS_DURATION);
}

function cancelLongPress(): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function handleTouchStart(event: TouchEvent): void {
  const touch = event.touches[0];
  if (!touch) return;

  const link = findLinkElement(event.target);
  if (link) {
    startLongPress(touch.clientX, touch.clientY, link);
  }
}

function handleTouchEnd(): void {
  cancelLongPress();
}

function handleTouchMove(): void {
  cancelLongPress();
}

function handleMouseDown(event: MouseEvent): void {
  if (event.button !== 0) return;

  const link = findLinkElement(event.target);
  if (link) {
    startLongPress(event.clientX, event.clientY, link);
  }
}

function handleMouseUp(): void {
  cancelLongPress();
}

function handleMouseMove(): void {
  cancelLongPress();
}

function handleDocumentClick(event: Event): void {
  const target = event.target as Element;
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

function init(): void {
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
