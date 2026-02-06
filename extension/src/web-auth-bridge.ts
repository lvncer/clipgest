window.addEventListener("message", (event: MessageEvent) => {
  if (event.source !== window) {
    return;
  }

  const data = event.data;

  if (!data || typeof data !== "object") {
    return;
  }

  if (data.type !== "CLIPGEST_EXTENSION_AUTH") {
    return;
  }

  if (event.origin !== window.location.origin) {
    return;
  }

  const token = data.token;
  const userId = data.userId as string | undefined;
  const apiBaseUrl = data.apiBaseUrl as string | undefined;

  if (typeof token !== "string" || !token) {
    return;
  }

  chrome.runtime.sendMessage(
    {
      type: "CLIPGEST_SAVE_AUTH",
      token,
      userId,
      apiBaseUrl,
    }
  );
});
