import React, { useEffect } from "react";
import particlesConfig from "../components/configs/particles-config"; // tetap pakai konfigurasi
import "../components/styles/heroSection.css";
import finjakebmo from "../assets/AdventurTime.png";
import { InfoAlert } from "../components/SweetAlert";

function Hero() {
  useEffect(() => {
    InfoAlert({
      title: "Ehmm.. Hello!",
      text: "This site is under development, thankyou for coming! Feel free to contact me for any inquiries! :)",
    });
  }, []);

  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS("particles-js", particlesConfig);
    }
  }, []);

  return (
    <div className="hero-container" id="hero">
      <div id="particles-js"></div>
      <div className="hero">
        <img className="hero-content" src={finjakebmo} alt="finjakebmo" />
        <div className="hero-content text">
          <span className="greetings">Hello, I'm</span>
          <span aria-label="ORI7ON_" className="name typewriter thick"></span>
          <span className="job">FullStack Web Developer</span>
        </div>
      </div>
    </div>
  );
}

export default Hero;
