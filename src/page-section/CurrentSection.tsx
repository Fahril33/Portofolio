import React from "react";
import "../components/styles/currentSection.css";
import "../components/styles/cards.css";
function CurrentSection() {
  return (
    <div className="currentSectionContainer" id="current">
      <h1 className="Text Header">Where I'm At</h1>
      <div className="currentSection">
        <div className="card">
          <div className="cardContent">
            <span className="Title">Ongoing Project</span>
            <div className="contents">
              <div className="currentContent">
                <img
                  src="https://i.pinimg.com/736x/a2/7c/fb/a27cfb4e5b0f87c61c8b9d231e64cde7.jpg"
                  alt=""
                />
              </div>
              <div className="currentContent">
                <span className="projectTitle">Quick Math</span>
                <p>
                  Quick Math is a math game that challenges players to solve
                  math problems as fast as possible. With many features and
                  customization options, it is a fun and engaging way to improve
                  your math skills.
                </p>
              </div>
              <div className="currentContent">
                <div className="tags">
                  <span style={{ backgroundColor: "#3C873A", color: "#fff" }}>
                    Node.js
                  </span>
                  <span style={{ backgroundColor: "#61dafb", color: "#222" }}>
                    React
                  </span>
                  <span style={{ backgroundColor: "#f7df1e", color: "#222" }}>
                    JavaScript
                  </span>
                  <span style={{ backgroundColor: "#3178c6", color: "#fff" }}>
                    TypeScript
                  </span>
                  <span style={{ backgroundColor: "#222", color: "#fff" }}>
                    CSS
                  </span>
                  <span style={{ backgroundColor: "#3ecf8e", color: "#fff" }}>
                    Supabase
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="cardContent">
            <span className="Title">Just Finished</span>
            <div className="contents">
              <div className="currentContent">
                <h1>Empty</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentSection;
