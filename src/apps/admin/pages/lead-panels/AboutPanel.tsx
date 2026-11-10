import React, { useMemo } from "react";
import type { AboutRow, AboutBaseline } from "../../types/adminTypes";
import type { AboutSettingsConfig } from "../../../../shared/types/aboutSettings";
import type { StorageBucket } from "../../../../lib/supabaseRest";
import TripleProgressButton from "../../../../shared/ui/TripleProgressButton";
import { AboutTextForm } from "./about/AboutTextForm";
import { AboutImageConfig } from "./about/AboutImageConfig";

export interface AboutPanelProps {
  about: AboutRow;
  aboutSettings: AboutSettingsConfig;
  busy: boolean;
  storageBuckets: StorageBucket[];
  baseline: AboutBaseline | null;
  setAbout: React.Dispatch<React.SetStateAction<AboutRow | null>>;
  setAboutSettings: React.Dispatch<React.SetStateAction<AboutSettingsConfig>>;
  onSave: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  onBucketCreated?: (bucket: StorageBucket) => void;
}

const AboutPanel: React.FC<AboutPanelProps> = ({
  about,
  aboutSettings,
  busy,
  storageBuckets,
  baseline,
  setAbout,
  setAboutSettings,
  onSave,
  getAccessToken,
  onBucketCreated,
}: AboutPanelProps): React.JSX.Element => {
  const isDirty = useMemo((): boolean => {
    if (!baseline) return false;
    return (
      JSON.stringify(about) !== JSON.stringify(baseline.about) ||
      JSON.stringify(aboutSettings) !== JSON.stringify(baseline.settings)
    );
  }, [about, aboutSettings, baseline]);

  const handleReset = (): void => {
    if (!baseline) return;
    setAbout(baseline.about);
    setAboutSettings(baseline.settings);
  };

  const handleTextChange = (patch: Partial<AboutRow>): void => {
    setAbout((prev: AboutRow | null): AboutRow | null => (prev ? { ...prev, ...patch } : prev));
  };

  return (
    <div className="formGrid">
      <AboutTextForm about={about} onChange={handleTextChange} />

      <hr className="settingsHr" />

      <AboutImageConfig
        about={about}
        aboutSettings={aboutSettings}
        storageBuckets={storageBuckets}
        setAbout={setAbout}
        setAboutSettings={setAboutSettings}
        getAccessToken={getAccessToken}
        onBucketCreated={onBucketCreated ?? ((): void => {})}
      />

      <div className="actionRow">
        <button type="button" className="btn" onClick={handleReset} disabled={busy}>
          Reset
        </button>
        <TripleProgressButton
          label="Save About"
          busy={busy}
          disabled={busy}
          isDirty={isDirty}
          onConfirm={onSave}
        />
      </div>
    </div>
  );
};

export default AboutPanel;
