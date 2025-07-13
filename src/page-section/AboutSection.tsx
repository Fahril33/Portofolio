import React from "react";
import "../components/styles/aboutSection.css";
import lmao from "../assets/lmaoPisan.jpg";
function About() {
    return (
      <div className="aboutSectionContainer">
        <div className="Picture">
          <img
            src={lmao}
            alt=""
          />
        </div>
        <div className="Text">
          <h1>About Me</h1>
          <p>
            Saya pengembang fullstack yang bersemangat mengubah ide menjadi
            solusi digital yang elegan.
            <br />
            <br />
            Dengan latar belakang di Teknik Informatika, saya mengkhususkan diri
            dalam membangun aplikasi yang user-friendly dan skalabel. Tujuan
            saya adalah menggabungkan kreativitas dan teknologi untuk
            menciptakan pengalaman digital yang berdampak.
          </p>
        </div>
      </div>
    );
}

export default About;
