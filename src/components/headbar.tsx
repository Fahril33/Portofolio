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
    transform: show ? "translateY(0)" : "translateY(-100%)",
    transition: "transform 0.5s cubic-bezier(0.86, 0, 0.07, 1)",
  };

  return (
    <nav className="navbar" style={navbarStyle}>
      <p><b>{codeSymbol}</b></p><ul>
        <li onClick={() => window.scrollTo(0, 0)}>Hero</li>
        <li onClick={() => window.scrollTo(0, 0)}>About</li>
        <li onClick={() => window.scrollTo(0, 0)}>Projects</li>
        <li onClick={() => window.scrollTo(0, 0)}>Current</li>
        <li onClick={() => window.scrollTo(0, 0)}>Future</li>
        <li><a href="https://instagram.com/muhammad_fchrl" target="_blank" rel="noopener noreferrer">Contact</a></li>
      </ul>
    </nav>
  );
}

export default Headbar;
