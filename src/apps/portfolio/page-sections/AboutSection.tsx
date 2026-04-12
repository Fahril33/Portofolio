import React, { useEffect, useState } from "react";
import "../components/styles/aboutSection.css";
import myPicture from "./../assets/myPict.png";
import { isSupabaseConfigured, storagePublicUrl, supabaseGet } from "../../../lib/supabaseRest";
import {
  defaultAboutSettingsConfig,
  normalizeAboutSettingsConfig,
  type AboutSettingsConfig,
} from "../../../shared/types/aboutSettings";

type AboutRow = {
  id: number;
  heading: string | null;
  tagline: string | null;
  body: string | null;
  image_url: string | null;
  image_alt: string | null;
};

function About() {
  const [remote, setRemote] = useState<AboutRow | null>(null);
  const [settings, setSettings] = useState<AboutSettingsConfig>(() =>
    defaultAboutSettingsConfig()
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;
    const load = async () => {
      try {
        const rows = await supabaseGet<AboutRow[]>("about_section", "id=eq.1", {
          select: "*",
        });
        if (cancelled) return;
        setRemote(rows[0] ?? null);
      } catch {
        // fallback to local content
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
    const load = async () => {
      try {
        const rows = await supabaseGet<Array<{ app: string; namespace: string; config: unknown }>>(
          "app_configs",
          "app=eq.portfolio&namespace=eq.about",
          { select: "app,namespace,config" }
        );
        if (cancelled) return;
        setSettings(normalizeAboutSettingsConfig(rows[0]?.config ?? null));
      } catch {
        // fallback
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const heading = remote?.heading ?? "About Me";
  const tagline = remote?.tagline ?? '"Imagine, Design, Code."';
  const body =
    remote?.body ??
    "I'm a Junior FullStack Web Developer with a passion for creating innovative and user-friendly applications.\nMy goal is to combine creativity and technology to create impactful digital experiences.";

  const legacyUrl = remote?.image_url?.trim() ? remote.image_url : "";
  const legacyAlt = remote?.image_alt?.trim() ? remote.image_alt : "Portrait";

  const storageUrl =
    settings.image.source === "storage" &&
    settings.image.storage.isPublic &&
    settings.image.storage.bucket.trim() &&
    settings.image.storage.path.trim()
      ? storagePublicUrl(settings.image.storage.bucket, settings.image.storage.path)
      : "";

  const imageSrc =
    settings.image.source === "storage"
      ? storageUrl || settings.image.url.trim() || legacyUrl || myPicture
      : settings.image.url.trim() || legacyUrl || myPicture;

  const imageAlt = settings.image.alt.trim() || legacyAlt;

  const imageStyle: React.CSSProperties = {
    objectFit: settings.image.size.objectFit,
    width: settings.image.size.widthPx ? `${settings.image.size.widthPx}px` : undefined,
    height: settings.image.size.heightPx ? `${settings.image.size.heightPx}px` : undefined,
  };

  return (
    <div className="aboutSectionContainer" id="about">
      {settings.image.enabled ? (
        <div className="Picture">
          <img src={imageSrc} alt={imageAlt} style={imageStyle} />
        </div>
      ) : null}
      <div className="Text">
        <h1>{heading}</h1>
        <p>{tagline}</p>
        <p>
          {body.split("\n").map((line, idx) => (
            <React.Fragment key={idx}>
              {idx === 0 ? null : <br />}
              {line}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}

export default About;
