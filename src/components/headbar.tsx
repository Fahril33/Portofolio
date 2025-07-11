import React from "react";
import "./styles/headbar.css";

function Headbar() {
  const codeSymbol = "</>";
  return (
    <nav className="navbar">
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
