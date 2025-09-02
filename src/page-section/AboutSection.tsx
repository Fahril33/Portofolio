import React from "react";
import "../components/styles/aboutSection.css";
import myPicture from "./../assets/myPict.png";

function About() {
  return (
    <div className="aboutSectionContainer" id="about">
      <div className="Picture">
        <img
          src={myPicture}
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
