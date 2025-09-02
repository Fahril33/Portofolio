import React from "react";
import "../components/styles/futureSection.css";
import "../components/styles/cards.css";
function FutureSections() {
    return (
      <div>
        <div className="futureSectionContainer" id="future">
          <h1 className="Text Header">Upcomings</h1>
          <div className="futureSection">
            <div className="card">
              <div className="cardContents">
                <span className="Title">Planned Project</span>
                <div className="cardContent">
                  <div className="currentContent">
                    <div className="cardContents">
                      <div className="cardContent">
                        <div className="currentContent">
                          <img
                            src="https://preview-portfolio-7cl47fdfw0aqoci9j.vusercontent.net/placeholder.svg?height=400&width=600"
                            alt="Quick Math Logo"
                            title="This is a placeholder logo. It will be replaced with a real logo when the project is complete."
                          />
                        </div>
                        <div className="currentContent">
                          <span className="projectTitle">Quick Math</span>
                          <p>
                            Quick Math is a math game that challenges players to
                            solve math problems as fast as possible. With many
                            features and customization options, it is a fun and
                            engaging way to improve your math skills.
                          </p>
                        </div>
                        <div className="currentContent">
                          <div className="tags">
                            <span
                              style={{
                                backgroundColor: "#3C873A",
                                color: "#fff",
                              }}
                            >
                              Node.js
                            </span>
                            <span
                              style={{
                                backgroundColor: "#61dafb",
                                color: "#222",
                              }}
                            >
                              React
                            </span>
                            <span
                              style={{
                                backgroundColor: "#3178c6",
                                color: "#fff",
                              }}
                            >
                              TypeScript
                            </span>
                            <span
                              style={{ backgroundColor: "#222", color: "#fff" }}
                            >
                              CSS
                            </span>
                            <span
                              style={{
                                backgroundColor: "#3ecf8e",
                                color: "#fff",
                              }}
                            >
                              Supabase
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="card">
              <div className="cardContents">
                <span className="Title">Planned Learns</span>
                <div className="cardContent">
                  <div className="currentContent">
                    <h1>Not Listed.</h1>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    );
}

export default FutureSections;
