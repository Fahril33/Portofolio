import React from "react";
import "../components/styles/projectSection.css";
import ProjectCard from "../components/Casrds";
import { projectData } from "../data/ProjectData";

const ProjectSections: React.FC = () => {
  return (
    <div className="projectSectionContainer" id="projects">
      <h1 className="Text Header">What I've Been Through</h1>
      <div className="projectSection">
        {projectData.map((section) => (
          <ProjectCard
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ))}
        
      </div>
      {/* <p style={{ color: "grey", textAlign: "center" }}>Simple Carousel here</p> */}
    </div>
  );
};

export default ProjectSections;
