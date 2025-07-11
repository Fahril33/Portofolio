import React, { useEffect } from "react";
import particlesConfig from "./configs/particles-config"; // tetap pakai konfigurasi
import "./styles/hero.css";
import finjakebmo from "../assets/atime.png";
import { InfoAlert } from "./popup";

function Hero() {
  useEffect(() => {
    InfoAlert({title: "Ehmm.. Hello!", text: "This site is under development, thankyou for coming!"});
  }, []); 
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
