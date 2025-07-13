import React, { useEffect } from "react";
import particlesConfig from "../components/configs/particles-config"; // tetap pakai konfigurasi
import "../components/styles/heroSection.css";
import finjakebmo from "../assets/AdventurTime.png";
import { InfoAlert } from "../components/SweetAlert";

function Hero() {
  // useEffect(() => {
  //   InfoAlert({
  //     title: "Ehmm.. Hello!",
  //     text: "This site is under development, thankyou for coming!",
  //   });
  //   console.log("Hello, I'm ORI7ON_");
  // }, []);

  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS("particles-js", particlesConfig);
    }
  }, []);

  return (
    <div className="hero-container">
      <div id="particles-js"></div>
      <div className="hero">
        <img className="hero-content" src={finjakebmo} alt="finjakebmo" />

        <div className="hero-content text">
          <span className="greetings">Hello, I'm</span>
          <span className="name">ORI7ON_ </span>
          <span className="job">FullStack Web Developer</span>
        </div>
      </div>
    </div>
  );
}

export default Hero;
