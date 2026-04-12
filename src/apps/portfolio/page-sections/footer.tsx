import React from "react";
import "../components/styles/footer.css";

function Footer() {
  return (
    <div className="footerContainer">
      <footer>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default Footer;
