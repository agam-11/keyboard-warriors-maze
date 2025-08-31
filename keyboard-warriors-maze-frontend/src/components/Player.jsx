// client/src/components/Player.jsx

import React from "react";

/**
 * Player Component
 * Represents the user's character on the maze.
 * @param {object} position - The player's current position { row, col }.
 * @param {number} cellSize - The size of each cell in the maze, for accurate positioning.
 */
const Player = ({ position, cellSize }) => {
  // Calculate position accounting for actual grid layout
  const gapSize = 1; // Grid gap from Maze component
  const actualTop = position.row * (cellSize + gapSize);
  const actualLeft = position.col * (cellSize + gapSize);
  
  const style = {
    position: "absolute",
    top: `${actualTop}px`,
    left: `${actualLeft}px`,
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    transition:
      "top 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15%", // 15% padding to keep Pacman well within bounds
  };

  return (
    <div style={style}>
      {/* FIXED: Pacman with proper containment and sizing */}
      <div
        className="bg-foreground rounded-full"
        style={{
          width: "100%",
          height: "100%",
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 40%, 50% 50%, 100% 60%, 100% 100%, 0% 100%)",
          boxShadow: "0 0 2px rgba(240, 230, 140, 0.3)",
        }}
      ></div>
    </div>
  );
};

export default Player;
