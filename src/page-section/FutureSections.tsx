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
                    <h1>Not Listed.</h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="cardContents">
                <span className="Title">Planned Learns</span>
                <div className="cardContent">
                  <div className="currentContent">
                    <h1>Not Listed.</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default FutureSections;
