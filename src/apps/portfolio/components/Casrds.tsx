import React from "react";
import { ProjectItem } from "../data/ProjectData";

type ProjectCardProps = {
  title: string;
  items: ProjectItem[];
};

const ProjectCard: React.FC<ProjectCardProps> = ({ title, items }) => {
  return (
    <div className="project">
      <div className="projectContent">
        <span className="Title">{title}</span>
        <div className="contents">
          {items.map(({ id, label, Icon }) => (
            <div className="content" key={id || label}>
              <div className="icon">
                <Icon />
              </div>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
