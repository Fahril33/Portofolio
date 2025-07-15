import React from "react";
import { ProjectItem } from "../data/ProjectData";

interface Props {
  title: string;
  items: ProjectItem[];
}

const ProjectCard: React.FC<Props> = ({ title, items }) => {
  return (
    <div className="project">
      <img src="" alt="" />
      <div className="projectContent">
        <span className="Title">{title}</span>
        <div className="contents">
          {items.map(({ label, Icon }) => (
            <div className="content" key={label}>
              <Icon />
              <p>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
