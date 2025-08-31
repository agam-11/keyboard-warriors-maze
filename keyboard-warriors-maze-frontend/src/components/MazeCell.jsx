import React from 'react';

// This component's only job is to render a single square of the maze with the correct color.
const MazeCell = ({ type }) => {
  const baseClasses = "w-full h-full";
  let colorClass = "";

  switch (type) {
    case 1:
      colorClass = "bg-border"; // Wall
      break;
    case 'S':
      colorClass = "bg-primary"; // Start
      break;
    case 'E':
      colorClass = "bg-accent"; // End
      break;
    default:
      colorClass = "bg-black/50"; // Path (0)
      break;
  }

  return <div className={`${baseClasses} ${colorClass}`}></div>;
};

export default MazeCell;
