import React from "react";
import "../components/styles/aboutSection.css";

function About() {
  return (
    <div className="aboutSectionContainer" id="about">
      <div className="Picture">
        <img
          src="https://i.pinimg.com/736x/a2/7c/fb/a27cfb4e5b0f87c61c8b9d231e64cde7.jpg"
          alt=""
        />
      </div>
      <div className="Text">
        <h1>About Me</h1>
        <p>
          "Imagine, Design, Code."
        </p>
        <p>
          I'm a Junior FullStack Web Developer with a passion for creating innovative
          and user-friendly applications. <br /> My goal is to combine creativity and
          technology to create impactful digital experiences.
        </p>
      </div>
    </div>
  );
}

export default About;
