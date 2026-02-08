type OGPData = {
  title: string;
  description: string;
  image: string;
};

function getMetaContent(key: string): string {
  const prop = document
    .querySelector(`meta[property="${key}"]`)
    ?.getAttribute("content");
  if (prop && prop.trim()) {
    return prop.trim();
  }
  const name = document
    .querySelector(`meta[name="${key}"]`)
    ?.getAttribute("content");
  return name ? name.trim() : "";
}

function resolveMaybeRelativeURL(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  try {
    return new URL(trimmed, document.baseURI).toString();
  } catch {
    return trimmed;
  }
}

function getPageOGP(): OGPData {
  const title =
    getMetaContent("og:title") ||
    getMetaContent("twitter:title") ||
    document.title ||
    "";
  const description =
    getMetaContent("og:description") ||
    getMetaContent("twitter:description") ||
    getMetaContent("description") ||
    "";
  const image =
    getMetaContent("og:image") ||
    getMetaContent("og:image:url") ||
    getMetaContent("twitter:image") ||
    getMetaContent("twitter:image:src") ||
    "";

  return {
    title: title.trim(),
    description: description.trim(),
    image: resolveMaybeRelativeURL(image),
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "CLIPGEST_TOAST") {
    window.alert(message.message);
    return;
  }

  if (message.type === "CLIPGEST_GET_OGP") {
    sendResponse({ success: true, ogp: getPageOGP() });
  }
});
