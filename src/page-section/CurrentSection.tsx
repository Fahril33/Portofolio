import React from "react";
import "../components/styles/currentSection.css";
import "../components/styles/cards.css";

function CurrentSection() {
  return (
    <div className="currentSectionContainer" id="current">
      <h1 className="Text Header">Where I'm At</h1>
      <div className="currentSection">
        <div className="card">
          <div className="cardContents">
            <span className="Title">Ongoing Project</span>
            <div className="cardContent">
              <div className="currentContent">
                <img
                  src="https://preview-portfolio-7cl47fdfw0aqoci9j.vusercontent.net/placeholder.svg?height=400&width=600"
                  alt="Quick Notes Logo"
                  title="This is a placeholder logo. It will be replaced with a real logo when the project is complete."
                />
              </div>
              <div className="currentContent">
                <span className="projectTitle">Quick Notes</span>
                <p>
                  quick notes is a personal scheduler application that is simple
                  and flexible, designed to help users manage their daily
                  routines, weekly schedules, important events, and task lists
                  efficiently. With main features such as weekly flat schedule,
                  daily schedule in template (reusable without data duplicate),
                  interactive calendar with reminders, and multifunctional todo
                  list (task, activity, notes).
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
                  <span style={{ backgroundColor: "#3178c6", color: "#fff" }}>
                    TypeScript
                  </span>
                  <span style={{ backgroundColor: "#222", color: "#fff" }}>
                    CSS
                  </span>
                  <span style={{ backgroundColor: "#3b82f6", color: "#fff" }}>
                    Tailwind CSS
                  </span>
                  <span style={{ backgroundColor: "#3ecf8e", color: "#fff" }}>
                    Supabase
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="card">
          <div className="cardContents">
            <span className="Title">Just Finished</span>
            <div className="cardContent">
              <div className="currentContent">
                <h1>Empty.</h1>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default CurrentSection;
