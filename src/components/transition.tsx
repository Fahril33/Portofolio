import React from "react";

type TransitionProps = {
  firstcolor: string;
  secondcolor: string;
  thirdcolor: string;
};

function Transition({ firstcolor, secondcolor, thirdcolor }: TransitionProps) {
  return (
    <div className="transition">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path
          fill={firstcolor}
          fillOpacity="1"
          d="M0,160L21.8,154.7C43.6,149,87,139,131,154.7C174.5,171,218,213,262,213.3C305.5,213,349,171,393,165.3C436.4,160,480,192,524,218.7C567.3,245,611,267,655,245.3C698.2,224,742,160,785,149.3C829.1,139,873,181,916,181.3C960,181,1004,139,1047,122.7C1090.9,107,1135,117,1178,138.7C1221.8,160,1265,192,1309,192C1352.7,192,1396,160,1418,144L1440,128L1440,0L1418.2,0C1396.4,0,1353,0,1309,0C1265.5,0,1222,0,1178,0C1134.5,0,1091,0,1047,0C1003.6,0,960,0,916,0C872.7,0,829,0,785,0C741.8,0,698,0,655,0C610.9,0,567,0,524,0C480,0,436,0,393,0C349.1,0,305,0,262,0C218.2,0,175,0,131,0C87.3,0,44,0,22,0L0,0Z"
        />
      </svg>
      <style>{` 
      .transition {
        height: auto;
      }`}</style>
    </div>
  );
}

export default Transition;
