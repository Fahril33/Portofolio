export type AboutImageSource = "url" | "storage";

export type AboutImageSettings = {
  enabled: boolean;
  source: AboutImageSource;
  url: string;
  alt: string;
  storage: {
    bucket: string;
    path: string;
    isPublic: boolean;
  };
  size: {
    widthPx: number | null;
    heightPx: number | null;
    objectFit: "contain" | "cover" | "fill" | "none" | "scale-down";
  };
};

export type AboutSettingsConfig = {
  version: 1;
  image: AboutImageSettings;
};

export const defaultAboutSettingsConfig = (): AboutSettingsConfig => ({
  version: 1,
  image: {
    enabled: true,
    source: "url",
    url: "",
    alt: "Portrait",
    storage: {
      bucket: "",
      path: "",
      isPublic: true,
    },
    size: {
      widthPx: null,
      heightPx: null,
      objectFit: "cover",
    },
  },
});

export const normalizeAboutSettingsConfig = (raw: unknown): AboutSettingsConfig => {
  const fallback = defaultAboutSettingsConfig();
  if (!raw || typeof raw !== "object") return fallback;
  const anyRaw = raw as any;
  if (anyRaw.version !== 1) return fallback;

  const image = anyRaw.image ?? {};
  const storage = image.storage ?? {};
  const size = image.size ?? {};

  return {
    version: 1,
    image: {
      enabled: Boolean(image.enabled ?? fallback.image.enabled),
      source: image.source === "storage" ? "storage" : "url",
      url: typeof image.url === "string" ? image.url : fallback.image.url,
      alt: typeof image.alt === "string" ? image.alt : fallback.image.alt,
      storage: {
        bucket: typeof storage.bucket === "string" ? storage.bucket : fallback.image.storage.bucket,
        path: typeof storage.path === "string" ? storage.path : fallback.image.storage.path,
        isPublic: Boolean(storage.isPublic ?? fallback.image.storage.isPublic),
      },
      size: {
        widthPx:
          typeof size.widthPx === "number" && Number.isFinite(size.widthPx) ? size.widthPx : null,
        heightPx:
          typeof size.heightPx === "number" && Number.isFinite(size.heightPx) ? size.heightPx : null,
        objectFit:
          size.objectFit === "contain" ||
          size.objectFit === "fill" ||
          size.objectFit === "none" ||
          size.objectFit === "scale-down"
            ? size.objectFit
            : "cover",
      },
    },
  };
};

