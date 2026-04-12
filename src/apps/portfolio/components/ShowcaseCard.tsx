import React from "react";

export type ShowcaseTag = {
  label: string;
  backgroundColor: string;
  color: string;
};

type ShowcaseCardProps = {
  headerTitle: string;
  projectTitle: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageTitle?: string;
  tags: ReadonlyArray<ShowcaseTag>;
};

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  headerTitle,
  projectTitle,
  description,
  imageSrc,
  imageAlt,
  imageTitle,
  tags,
}) => {
  return (
    <div className="card">
      <div className="cardContents">
        <span className="Title">{headerTitle}</span>
        <div className="cardContent">
          <div className="currentContent">
            <img src={imageSrc} alt={imageAlt} title={imageTitle} />
          </div>
          <div className="currentContent">
            <span className="projectTitle">{projectTitle}</span>
            <p>{description}</p>
          </div>
          <div className="currentContent">
            <div className="tags">
              {tags.map((tag) => (
                <span
                  key={tag.label}
                  style={{
                    backgroundColor: tag.backgroundColor,
                    color: tag.color,
                  }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseCard;
