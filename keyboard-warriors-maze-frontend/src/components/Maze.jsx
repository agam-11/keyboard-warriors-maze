// client/src/components/Maze.jsx

import React from "react";

// Define a simple mapping for cell types to their CSS classes
const cellTypeClasses = {
  0: "bg-black/50", // Path
  1: "bg-border", // Wall
  S: "bg-primary", // Start
  E: "bg-accent", // End
};

/**
 * Maze Component
 * Renders a grid-based maze from a 2D array blueprint.
 * @param {Array<Array<number|string>>} mazeData - The 2D array representing the maze.
 * @param {object} playerPosition - The player's current position { row, col }.
 */
const Maze = ({ mazeData, playerPosition }) => {
  if (!mazeData || mazeData.length === 0) {
    return <div>Loading Maze...</div>;
  }

  return (
    <div
      // UPDATED: Using grid gap for cleaner lines.
      // The background color of this container acts as the grid line color.
      className="grid gap-[1px] bg-border/20 rounded-md overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${mazeData[0].length}, minmax(0, 1fr))`,
        width: "100%",
        aspectRatio: `${mazeData[0].length} / ${mazeData.length}`, // Maintain aspect ratio
      }}
    >
      {mazeData.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          // Check if player is in this cell
          const isPlayerHere = playerPosition && 
            playerPosition.row === rowIndex && 
            playerPosition.col === colIndex;
            
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              // The individual cell's background color covers the grid container's background.
              className={`flex items-center justify-center ${
                cellTypeClasses[cell] || "bg-black"
              } relative`}
            >
              {/* Render Pacman if player is in this cell */}
              {isPlayerHere && (
                <div
                  className="bg-foreground rounded-full"
                  style={{
                    width: "60%",
                    height: "60%",
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 100% 40%, 50% 50%, 100% 60%, 100% 100%, 0% 100%)",
                    boxShadow: "0 0 2px rgba(240, 230, 140, 0.3)",
                  }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Maze;
