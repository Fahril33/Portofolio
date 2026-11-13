import { useEffect, useState } from "react";
import portrait from "../assets/myPict.png";
import { isSupabaseConfigured, supabaseGet } from "../../../lib/supabaseRest";
import { defaultAboutSettingsConfig, normalizeAboutSettingsConfig } from "../../../shared/types/aboutSettings";
import { getCachedAboutImageUrl, resolveAboutImageUrl, setCachedAboutImageUrl } from "../lib/aboutImagePreload";

const stories = [
  { title: "It starts with curiosity.", caption: "I connect ideas, explore possibilities, and find a different way to see things." },
  { title: "Ideas deserve intention.", caption: "I turn possibilities into thoughtful layouts, clear interactions, and experiences that feel natural." },
  { title: "Make it work. Make it matter.", caption: "I bring the details to life through code, one interaction and one useful solution at a time." },
  { title: "Creative mind. Developer at heart.", caption: "I turn thoughtful ideas into useful digital experiences, from the first sketch to the final interaction." },
];

type AboutContent = { heading: string | null; tagline: string | null; body: string | null; image_url: string | null; image_alt: string | null };

export default function AboutProfile({ form, visible }: { form: number; visible: boolean }) {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [settings, setSettings] = useState(defaultAboutSettingsConfig);
  const [image, setImage] = useState(() => getCachedAboutImageUrl() || portrait);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    void Promise.allSettled([
      supabaseGet<AboutContent[]>("about_section", "id=eq.1", { select: "heading,tagline,body,image_url,image_alt" }),
      supabaseGet<Array<{ config: unknown }>>("app_configs", "app=eq.portfolio&namespace=eq.about", { select: "config" }),
    ]).then(([about, config]) => {
      if (cancelled) return;
      const row = about.status === "fulfilled" ? about.value[0] ?? null : null;
      const nextSettings = normalizeAboutSettingsConfig(config.status === "fulfilled" ? config.value[0]?.config : null);
      setContent(row);
      setSettings(nextSettings);
      const url = resolveAboutImageUrl(row?.image_url, nextSettings);
      if (url) { setImage(url); setCachedAboutImageUrl(url); }
    });
    return () => { cancelled = true; };
  }, []);
  const story = stories[form];
  // The three words already label the object; retain other customized taglines.
  const tagline = content?.tagline?.trim();
  const showTagline = tagline && tagline.toLowerCase().replace(/[^a-z]/g, "") !== "imaginedesigncode";
  const caption = form === 3 ? content?.body?.trim() || story.caption : story.caption;
  return (
    <aside className="idc-profile" aria-hidden={!visible} aria-label="About the creator">
      <div className="idc-profile-identity">
        {settings.image.enabled && <div className="idc-portrait-frame">
          <img src={image} decoding="async" alt={content?.image_alt || settings.image.alt || "Profile portrait"}
            style={{ objectFit: settings.image.size.objectFit }}
            onError={() => setImage(portrait)} />
          <span className="idc-portrait-mark" aria-hidden="true">{form === 2 ? "</>" : form === 1 ? "+" : "✳"}</span>
        </div>}
        <div className="idc-profile-intro">
          <h3>{content?.heading || "Hi, I'm Fahril."}</h3>
          {showTagline && <p>{tagline}</p>}
        </div>
      </div>
      <div className="idc-profile-story" key={form}>
        <h4>{story.title}</h4>
        <p>{caption}</p>
      </div>
    </aside>
  );
}
