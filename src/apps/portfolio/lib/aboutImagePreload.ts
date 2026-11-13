import { isSupabaseConfigured, storagePublicUrl, supabaseGet } from "../../../lib/supabaseRest";
import { normalizeAboutSettingsConfig, type AboutSettingsConfig } from "../../../shared/types/aboutSettings";

export interface AboutRowSummary {
  image_url: string | null;
}

export const ABOUT_IMAGE_CACHE_KEY = "portfolio_about_image_cache";

export const ABOUT_PLACEHOLDER_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" fill="#1e2238"/>
      <circle cx="100" cy="78" r="36" fill="#323859"/>
      <path d="M38 180 C38 136, 68 128, 100 128 C132 128, 162 136, 162 180 Z" fill="#323859"/>
    </svg>`.trim()
  );

export const getCachedAboutImageUrl = (): string => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(ABOUT_IMAGE_CACHE_KEY) ?? "";
  } catch {
    return "";
  }
};

export const setCachedAboutImageUrl = (url: string): void => {
  if (typeof window === "undefined") return;
  try {
    if (url && url !== ABOUT_PLACEHOLDER_SRC) {
      window.localStorage.setItem(ABOUT_IMAGE_CACHE_KEY, url);
    }
  } catch {
    // Ignore storage quota or security errors
  }
};

export const preloadBrowserImage = (url: string): void => {
  if (typeof window === "undefined" || !url || url === ABOUT_PLACEHOLDER_SRC) return;
  const img = new Image();
  img.src = url;
};

export const resolveAboutImageUrl = (
  remoteImageUrl?: string | null,
  settings?: AboutSettingsConfig | null
): string => {
  const legacyUrl = remoteImageUrl?.trim() ? remoteImageUrl.trim() : "";
  if (!settings) {
    return legacyUrl;
  }

  if (settings.image.source === "storage") {
    const bucket = settings.image.storage.bucket.trim();
    const path = settings.image.storage.path.trim();
    if (bucket && path) {
      return storagePublicUrl(bucket, path);
    }
    return settings.image.url.trim() || legacyUrl;
  }

  return settings.image.url.trim() || legacyUrl;
};

export const preloadAboutImage = async (): Promise<string> => {
  if (typeof window === "undefined") return "";

  // Step 1: Preload cached URL immediately from memory/disk cache
  const cachedUrl = getCachedAboutImageUrl();
  if (cachedUrl) {
    preloadBrowserImage(cachedUrl);
  }

  if (!isSupabaseConfigured()) {
    return cachedUrl;
  }

  // Step 2: Fetch DB about image configuration early in the background
  try {
    const [aboutRows, configRows] = await Promise.all([
      supabaseGet<AboutRowSummary[]>("about_section", "id=eq.1", {
        select: "image_url",
      }),
      supabaseGet<Array<{ config: unknown }>>(
        "app_configs",
        "app=eq.portfolio&namespace=eq.about",
        { select: "config" }
      ),
    ]);

    const remoteImg = aboutRows[0]?.image_url ?? null;
    const settings = normalizeAboutSettingsConfig(configRows[0]?.config ?? null);
    const resolvedUrl = resolveAboutImageUrl(remoteImg, settings);

    if (resolvedUrl) {
      setCachedAboutImageUrl(resolvedUrl);
      preloadBrowserImage(resolvedUrl);
      return resolvedUrl;
    }
  } catch {
    // Fallback gracefully
  }

  return cachedUrl;
};

