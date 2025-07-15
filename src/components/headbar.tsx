import React, { useEffect } from "react";
import "./styles/headbar.css";

function Headbar() {
  const codeSymbol = "</>";
  const [show, setShow] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState("hero");
  const lastScroll = React.useRef(window.scrollY);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll.current && currentScroll > 50) {
        setShow(false);
      } else {
        setShow(true);
      }
      lastScroll.current = currentScroll;

      // Section highlight logic
      const sectionIds = ["hero", "about", "projects", "current", "future", "contact"];
      let found = false;
      for (let id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Section is considered active if top is below 0 and bottom is at least 80px visible
          if (rect.top <= 80 && rect.bottom > 80 && !found) {
            setActiveSection(id);
            found = true;
          }
        }
      }
      // Fallback: jika tidak ada yg match, tetap di hero
      if (!found) setActiveSection("hero");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger sekali saat mount
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navbarStyle = {
    transform: show ? "translateY(0)" : "translateY(-108%)",
    transition: "transform 0.5s cubic-bezier(0.86, 0, 0.07, 1)",
  };

  return (
    <nav className="navbar" style={navbarStyle}>
      <p>
        <b>{codeSymbol}</b>
      </p>
      <ul>
        <li
          className={activeSection === "hero" ? "active" : ""}
          onClick={() => {
            const el = document.getElementById("hero");
            if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
          }}
        >
          Hero
        </li>
        <li
          className={activeSection === "about" ? "active" : ""}
          onClick={() => {
            const el = document.getElementById("about");
            if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
          }}
        >
          About
        </li>
        <li
          className={activeSection === "projects" ? "active" : ""}
          onClick={() => {
            const el = document.getElementById("projects");
            if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
          }}
        >
          Projects
        </li>
        <li
          className={activeSection === "current" ? "active" : ""}
          onClick={() => {
            const el = document.getElementById("current");
            if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
          }}
        >
          Current
        </li>
        <li
          className={activeSection === "future" ? "active" : ""}
          onClick={() => {
            const el = document.getElementById("future");
            if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
          }}
        >
          Future
        </li>
        <li
          className={activeSection === "contact" ? "active" : ""}
          onClick={() => {
            const el = document.getElementById("contact");
            if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
          }}
        >
          Contact
        </li>
      </ul>
    </nav>
  );
}

export default Headbar;
