import React from "react";

type TransitionProps = {
    firstcolor: string;
    secondcolor: string;
    thirdcolor: string;
    };

function Transition({firstcolor, secondcolor, thirdcolor}: TransitionProps) {
  return (
    <div
      className="transition"
      style={{
        height: "20vh",
        width: "100vw",
        background: `linear-gradient(to bottom, ${firstcolor}, ${secondcolor}, ${thirdcolor})`,
      }}
    />
  );
}

export default Transition;