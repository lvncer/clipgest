chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CLIPGEST_TOAST") {
    window.alert(message.message);
  }
});
