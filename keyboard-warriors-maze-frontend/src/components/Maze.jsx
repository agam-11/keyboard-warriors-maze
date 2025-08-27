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
 */
const Maze = ({ mazeData }) => {
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
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            // The individual cell's background color covers the grid container's background.
            className={`flex items-center justify-center ${
              cellTypeClasses[cell] || "bg-black"
            }`}
            // REMOVED: The inline border style is no longer needed.
          >
            {/* You could render icons or text here in the future */}
          </div>
        ))
      )}
    </div>
  );
};

export default Maze;
