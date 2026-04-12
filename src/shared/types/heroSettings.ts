export type TypewriterSettings = {
  enabled: boolean;
  rotate: boolean;
  texts: string[];
  defaultIndex: number;
  typingMs: number;
  deletingMs: number;
  pauseMs: number;
  loop: boolean;
};

export type WelcomeAlertSettings = {
  enabled: boolean;
};

export type HeroImageSource = "url" | "storage";

export type HeroImageSettings = {
  enabled: boolean;
  position: "left" | "right";
  source: HeroImageSource;
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

export type HeroSettingsConfig = {
  version: 1;
  typewriter: TypewriterSettings;
  welcomeAlert: WelcomeAlertSettings;
  heroImage: HeroImageSettings;
};

export const defaultHeroSettingsConfig = (): HeroSettingsConfig => ({
  version: 1,
  typewriter: {
    enabled: true,
    rotate: true,
    texts: ["ORI7ON_", "FAHRIL"],
    defaultIndex: 0,
    typingMs: 70,
    deletingMs: 40,
    pauseMs: 1200,
    loop: true,
  },
  welcomeAlert: {
    enabled: true,
  },
  heroImage: {
    enabled: true,
    position: "left",
    source: "url",
    url: "",
    alt: "Hero illustration",
    storage: {
      bucket: "",
      path: "",
      isPublic: true,
    },
    size: {
      widthPx: null,
      heightPx: null,
      objectFit: "contain",
    },
  },
});

export const normalizeHeroSettingsConfig = (raw: unknown): HeroSettingsConfig => {
  const fallback = defaultHeroSettingsConfig();
  if (!raw || typeof raw !== "object") return fallback;
  const anyRaw = raw as any;
  if (anyRaw.version !== 1) return fallback;

  const typewriter = anyRaw.typewriter ?? {};
  const welcomeAlert = anyRaw.welcomeAlert ?? {};
  const heroImage = anyRaw.heroImage ?? {};
  const storage = heroImage.storage ?? {};
  const size = heroImage.size ?? {};

  const texts = Array.isArray(typewriter.texts)
    ? typewriter.texts.filter((t: unknown) => typeof t === "string" && t.trim().length > 0)
    : fallback.typewriter.texts;

  const defaultIndex =
    typeof typewriter.defaultIndex === "number" && Number.isFinite(typewriter.defaultIndex)
      ? typewriter.defaultIndex
      : fallback.typewriter.defaultIndex;

  return {
    version: 1,
    typewriter: {
      enabled: Boolean(typewriter.enabled ?? fallback.typewriter.enabled),
      rotate: Boolean(typewriter.rotate ?? fallback.typewriter.rotate),
      texts: texts.length > 0 ? texts : fallback.typewriter.texts,
      defaultIndex: Math.max(0, Math.min((texts.length || 1) - 1, Math.floor(defaultIndex))),
      typingMs:
        typeof typewriter.typingMs === "number" && typewriter.typingMs > 0
          ? Math.floor(typewriter.typingMs)
          : fallback.typewriter.typingMs,
      deletingMs:
        typeof typewriter.deletingMs === "number" && typewriter.deletingMs > 0
          ? Math.floor(typewriter.deletingMs)
          : fallback.typewriter.deletingMs,
      pauseMs:
        typeof typewriter.pauseMs === "number" && typewriter.pauseMs >= 0
          ? Math.floor(typewriter.pauseMs)
          : fallback.typewriter.pauseMs,
      loop: Boolean(typewriter.loop ?? fallback.typewriter.loop),
    },
    welcomeAlert: {
      enabled: Boolean(welcomeAlert.enabled ?? fallback.welcomeAlert.enabled),
    },
    heroImage: {
      enabled: Boolean(heroImage.enabled ?? fallback.heroImage.enabled),
      position: heroImage.position === "right" ? "right" : "left",
      source: heroImage.source === "storage" ? "storage" : "url",
      url: typeof heroImage.url === "string" ? heroImage.url : fallback.heroImage.url,
      alt: typeof heroImage.alt === "string" ? heroImage.alt : fallback.heroImage.alt,
      storage: {
        bucket: typeof storage.bucket === "string" ? storage.bucket : fallback.heroImage.storage.bucket,
        path: typeof storage.path === "string" ? storage.path : fallback.heroImage.storage.path,
        isPublic: Boolean(storage.isPublic ?? fallback.heroImage.storage.isPublic),
      },
      size: {
        widthPx:
          typeof size.widthPx === "number" && Number.isFinite(size.widthPx) ? size.widthPx : null,
        heightPx:
          typeof size.heightPx === "number" && Number.isFinite(size.heightPx) ? size.heightPx : null,
        objectFit:
          size.objectFit === "cover" ||
          size.objectFit === "fill" ||
          size.objectFit === "none" ||
          size.objectFit === "scale-down"
            ? size.objectFit
            : "contain",
      },
    },
  };
};

