import { getConfig, saveConfig } from "./storage";
import { getAuthState } from "./auth";

const apiBaseUrlInput = document.getElementById(
  "apiBaseUrl",
) as HTMLInputElement;
const clerkFrontendApiUrlInput = document.getElementById(
  "clerkFrontendApiUrl",
) as HTMLInputElement;
const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;
const authIcon = document.getElementById("authIcon") as HTMLDivElement;
const authTitle = document.getElementById("authTitle") as HTMLElement;
const authSubtitle = document.getElementById("authSubtitle") as HTMLElement;
const loggedOutSection = document.getElementById(
  "loggedOutSection",
) as HTMLDivElement;
const loggedInSection = document.getElementById(
  "loggedInSection",
) as HTMLDivElement;

async function loadConfig(): Promise<void> {
  const config = await getConfig();
  apiBaseUrlInput.value = config.apiBaseUrl;
  clerkFrontendApiUrlInput.value = config.clerkFrontendApiUrl;

  await updateAuthUI();
}

async function updateAuthUI(): Promise<void> {
  const authState = await getAuthState();

  if (authState.isAuthenticated) {
    authIcon.textContent = "✅";
    authIcon.className = "auth-status-icon logged-in";
    authTitle.textContent = "ログイン済み";
    authSubtitle.textContent = `User ID: ${authState.userId?.slice(0, 16)}...`;
    loggedOutSection.classList.add("hidden");
    loggedInSection.classList.remove("hidden");
  } else {
    authIcon.textContent = "❌";
    authIcon.className = "auth-status-icon logged-out";
    authTitle.textContent = "ログインしていません";
    authSubtitle.textContent = "ログインしてリンクを保存しましょう";
    loggedOutSection.classList.remove("hidden");
    loggedInSection.classList.add("hidden");
  }
}

async function handleSave(): Promise<void> {
  try {
    await saveConfig({
      apiBaseUrl: apiBaseUrlInput.value.trim() || "http://localhost:8080",
      clerkFrontendApiUrl: clerkFrontendApiUrlInput.value.trim(),
    });

    showStatus("Settings saved successfully! ✨", "success");
  } catch (error) {
    showStatus(`Failed to save: ${error}`, "error");
  }
}

function showStatus(message: string, type: "success" | "error"): void {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;

  setTimeout(() => {
    statusDiv.className = "status";
  }, 5000);
}

if (saveBtn) {
  saveBtn.addEventListener("click", handleSave);
}

loadConfig();
