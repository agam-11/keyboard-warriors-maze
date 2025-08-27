// client/src/components/Player.jsx

import React from "react";

/**
 * Player Component
 * Represents the user's character on the maze.
 * @param {object} position - The player's current position { row, col }.
 * @param {number} cellSize - The size of each cell in the maze, for accurate positioning.
 */
const Player = ({ position, cellSize }) => {
  const style = {
    position: "absolute",
    top: `${position.row * cellSize}px`,
    left: `${position.col * cellSize}px`,
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    transition: "top 0.2s ease-in-out, left 0.2s ease-in-out",
  };

  return (
    <div style={style} className="flex items-center justify-center">
      {/* FINAL, SIMPLIFIED FIX:
        - Scrapped the complex SVG.
        - Using a simple div with a border trick to create a Pac-Man shape.
        - Tailwind classes handle the sizing, centering, and styling reliably.
      */}
      <div
        className="w-3/4 h-3/4 bg-foreground rounded-full"
        style={{
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 40%, 50% 50%, 100% 60%, 100% 100%, 0% 100%)",
          boxShadow: "0 0 8px rgba(240, 230, 140, 0.7)",
        }}
      ></div>
    </div>
  );
};

export default Player;
