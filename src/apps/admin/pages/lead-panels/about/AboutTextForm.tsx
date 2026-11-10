import React from "react";
import type { AboutRow } from "../../../types/adminTypes";

export interface AboutTextFormProps {
  about: AboutRow;
  onChange: (patch: Partial<AboutRow>) => void;
}

export const AboutTextForm: React.FC<AboutTextFormProps> = ({
  about,
  onChange,
}: AboutTextFormProps): React.JSX.Element => {
  return (
    <>
      <div className="formField">
        <label>Heading</label>
        <input
          value={about.heading ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            onChange({ heading: e.target.value })
          }
        />
      </div>
      <div className="formField">
        <label>Tagline</label>
        <input
          value={about.tagline ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            onChange({ tagline: e.target.value })
          }
        />
      </div>
      <div className="formField fullWidth">
        <label>Body Description</label>
        <textarea
          value={about.body ?? ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void =>
            onChange({ body: e.target.value })
          }
        />
      </div>
    </>
  );
};
