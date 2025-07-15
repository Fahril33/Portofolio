import React from "react";
import "./styles/headbar.css";

function Headbar() {
  const codeSymbol = "</>";

  const [show, setShow] = React.useState(true);
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
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
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
        <li onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Hero
        </li>
        <li
          onClick={() => {
            const el = document.getElementById("about");
            if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
          }}
        >
          About
        </li>
        <li
          onClick={() => {
            const el = document.getElementById("projects");
            if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
          }}
        >
          Projects
        </li>
        <li
          onClick={() => {
            const el = document.getElementById("current");
            if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
          }}
        >
          Current
        </li>
        <li
          onClick={() => {
            const el = document.getElementById("future");
            if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
          }}
        >
          Future
        </li>
        <li>
          <a
            href="https://instagram.com/muhammad_fchrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Headbar;
