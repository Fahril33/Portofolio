import React, { useEffect } from "react";
import particlesConfig from "../components/configs/particles-config"; // tetap pakai konfigurasi
import "../components/styles/heroSection.css";
import finjakebmo from "../assets/AdventurTime.png";
import { InfoAlert } from "../components/SweetAlert";
import { isSupabaseConfigured, storagePublicUrl, supabaseGet } from "../../../lib/supabaseRest";
import TypewriterText from "../components/TypewriterText";
import {
  defaultHeroSettingsConfig,
  normalizeHeroSettingsConfig,
  type HeroSettingsConfig,
} from "../../../shared/types/heroSettings";

type HeroRow = {
  id: number;
  greeting: string | null;
  job_title: string | null;
  welcome_title: string | null;
  welcome_text: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
};

function Hero() {
  const [remote, setRemote] = React.useState<HeroRow | null>(null);
  const [settings, setSettings] = React.useState<HeroSettingsConfig>(() =>
    defaultHeroSettingsConfig()
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;

    const load = async () => {
      try {
        const rows = await supabaseGet<HeroRow[]>("hero_section", "id=eq.1", {
          select: "*",
        });
        if (cancelled) return;
        setRemote(rows[0] ?? null);
      } catch {
        // fallback
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const rows = await supabaseGet<Array<{ app: string; namespace: string; config: unknown }>>(
          "app_configs",
          "app=eq.portfolio&namespace=eq.hero",
          { select: "app,namespace,config" }
        );
        if (cancelled) return;
        setSettings(normalizeHeroSettingsConfig(rows[0]?.config ?? null));
      } catch {
        // fallback to defaults
      }
    };

    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const key = "portfolio_welcome_alert_shown";
    if (sessionStorage.getItem(key)) return;
    if (!settings.welcomeAlert.enabled) return;

    InfoAlert({
      title: remote?.welcome_title ?? "Ehmm.. Hello!",
      text:
        remote?.welcome_text ??
        "This site is under development, thank you for coming! Feel free to contact me for any inquiries! :)",
    });

    sessionStorage.setItem(key, "1");
  }, [remote?.welcome_text, remote?.welcome_title, settings.welcomeAlert.enabled]);

  useEffect(() => {
    let cancelled = false;
    let frames = 0;
    const maxFrames = 60 * 5; // ~5s

    const tryInit = () => {
      if (cancelled) return;
      if (window.particlesJS) {
        window.particlesJS("particles-js", particlesConfig);
        return;
      }

      frames += 1;
      if (frames < maxFrames) window.requestAnimationFrame(tryInit);
    };

    tryInit();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedImageAlt =
    settings.heroImage.alt?.trim() ||
    remote?.hero_image_alt?.trim() ||
    "Hero illustration";

  const storageBucket = settings.heroImage.storage.bucket.trim();
  const storagePath = settings.heroImage.storage.path.trim();
  const publicStorageUrl =
    storageBucket && storagePath ? storagePublicUrl(storageBucket, storagePath) : "";

  const resolvedImageUrl = (() => {
    if (settings.heroImage.source === "storage" && settings.heroImage.storage.isPublic) {
      if (publicStorageUrl) return publicStorageUrl;
    }

    const configuredUrl = settings.heroImage.url.trim();
    if (configuredUrl) return configuredUrl;

    const legacyUrl = remote?.hero_image_url?.trim() ?? "";
    if (legacyUrl) return legacyUrl;

    return finjakebmo;
  })();

  const heroImageStyle: React.CSSProperties = {
    objectFit: settings.heroImage.size.objectFit,
    width: settings.heroImage.size.widthPx ? `${settings.heroImage.size.widthPx}px` : undefined,
    height: settings.heroImage.size.heightPx ? `${settings.heroImage.size.heightPx}px` : undefined,
    maxWidth: "100%",
  };

  return (
    <div className="hero-container" id="hero">
      <div id="particles-js"></div>
      <div className={`hero ${settings.heroImage.enabled ? "" : "noHeroImage"}`}>
        {settings.heroImage.enabled && settings.heroImage.position === "left" ? (
          <img
            className="hero-content"
            src={resolvedImageUrl}
            alt={resolvedImageAlt}
            style={heroImageStyle}
            draggable="false"
          />
        ) : null}

        <div className="hero-content text">
          <span className="greetings">{remote?.greeting ?? "Hello, I'm"}</span>
          <TypewriterText className="name typewriter thick" settings={settings.typewriter} />
          <span className="job">{remote?.job_title ?? "FullStack Web Developer"}</span>
        </div>

        {settings.heroImage.enabled && settings.heroImage.position === "right" ? (
          <img
            className="hero-content"
            src={resolvedImageUrl}
            alt={resolvedImageAlt}
            style={heroImageStyle}
          />
        ) : null}
      </div>
    </div>
  );
}

export default Hero;
