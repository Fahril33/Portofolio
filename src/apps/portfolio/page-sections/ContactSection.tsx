import React from "react";
import "../components/styles/contactSection.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faGithub,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import { isSupabaseConfigured, supabaseGet } from "../../../lib/supabaseRest";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

const CONTACT_LINKS = [
  {
    label: "Facebook",
    className: "facebook",
    href: "https://www.facebook.com/ClasherPensiun24",
    icon: faFacebookF,
  },
  {
    label: "Instagram",
    className: "instagram",
    href: "https://www.instagram.com/muhammad_fchrl",
    icon: faInstagram,
  },
  {
    label: "GitHub",
    className: "github",
    href: "https://www.github.com/fahril33",
    icon: faGithub,
  },
  {
    label: "LinkedIn",
    className: "linkedin",
    href: "https://www.linkedin.com/in/mfahril",
    icon: faLinkedinIn,
  },
] as const;

type SocialRow = {
  id: number;
  label: string;
  href: string;
  icon: string;
  sort_order: number;
  active: boolean;
};

const iconMap = {
  facebook: faFacebookF,
  instagram: faInstagram,
  github: faGithub,
  linkedin: faLinkedinIn,
} as const;

type ContactLink = {
  label: string;
  className: string;
  href: string;
  icon: IconDefinition;
};

const ContactSection: React.FC = () => {
  const [links, setLinks] = React.useState<ContactLink[]>(() =>
    CONTACT_LINKS.map((l) => ({
      label: l.label,
      className: l.className,
      href: l.href,
      icon: l.icon,
    }))
  );

  React.useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;

    const load = async () => {
      try {
        const rows = await supabaseGet<SocialRow[]>(
          "social_links",
          "active=eq.true&order=sort_order.asc",
          { select: "*" }
        );
        if (cancelled) return;

        const mapped: ContactLink[] = rows
          .map((row) => {
            const iconKey = row.icon?.toLowerCase?.() ?? "";
            const icon = (iconMap as Record<string, IconDefinition | undefined>)[iconKey];
            if (!icon) return null;
            const className = iconKey;
            return {
              label: row.label,
              className,
              href: row.href,
              icon,
            };
          })
          .filter((v): v is ContactLink => Boolean(v));

        if (mapped.length > 0) setLinks(mapped);
      } catch {
        // fallback to local
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="contactSectionContainer" id="contact">
      <h1 className="Text Header">Catch Me Up</h1>
      <div className="contactSection">
        {links.map((link, idx) => (
          <a
            key={`${link.label}-${idx}`}
            className={`contactItem ${link.className}`}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
          >
            <FontAwesomeIcon icon={link.icon} />
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ContactSection;
