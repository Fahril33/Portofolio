import React from "react";
import "../components/styles/contactSection.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faGithub,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";

const ContactSection: React.FC = () => {
  return (
    <div className="contactSectionContainer" id="contact">
      <h1 className="Text Header">Catch Me Up</h1>
      <div className="contactSection">
        <div className="contactItem facebook" onClick={() => window.open("https://www.facebook.com/ClasherPensiun24", "_blank")}>
          <FontAwesomeIcon icon={faFacebookF} />
          <span>Facebook</span>
        </div>
        <div className="contactItem instagram" onClick={() => window.open("https://www.instagram.com/muhammad_fchrl", "_blank")}>
          <FontAwesomeIcon icon={faInstagram} />
          <span>Instagram</span>
        </div>
        <div className="contactItem github" onClick={() => window.open("https://www.github.com/fahril33", "_blank")}>
          <FontAwesomeIcon icon={faGithub} />
          <span>Github</span>
        </div>
        <div className="contactItem linkedin" onClick={() => window.open("https://www.linkedin.com/in/mfahril", "_blank")}>
          <FontAwesomeIcon icon={faLinkedinIn} />
          <span>Linkedin</span>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
