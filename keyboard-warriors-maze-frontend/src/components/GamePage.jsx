// client/src/components/GamePage.jsx

import React, { useState, useMemo, useRef, useEffect } from "react";
import Maze from "./Maze";
import CodeEditor from "./CodeEditor";
import Player from "./Player";

// A solvable maze blueprint.
const sampleMaze = [
  ["S", 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  [1, 1, 0, 0, 0, 1, 1, 0, 1, "E"],
];

// Helper functions to find start and end positions
const findPosition = (maze, char) => {
  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[r].length; c++) {
      if (maze[r][c] === char) {
        return { row: r, col: c };
      }
    }
  }
  return null;
};

const GamePage = () => {
  const [code, setCode] = useState("");
  const startPosition = useMemo(() => findPosition(sampleMaze, "S"), []);
  const endPosition = useMemo(() => findPosition(sampleMaze, "E"), []);

  const [playerPosition, setPlayerPosition] = useState(startPosition);
  const mazeContainerRef = useRef(null);
  const [cellSize, setCellSize] = useState(0);

  const [hasWon, setHasWon] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (!hasWon) {
        setTime((prevTime) => prevTime + 1);
      }
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [hasWon]);

  useEffect(() => {
    const calculateCellSize = () => {
      if (mazeContainerRef.current) {
        const mazeWidth = mazeContainerRef.current.offsetWidth;
        setCellSize(mazeWidth / sampleMaze[0].length);
      }
    };
    calculateCellSize();
    window.addEventListener("resize", calculateCellSize);
    return () => window.removeEventListener("resize", calculateCellSize);
  }, []);

  const movePlayer = (direction, currentPos) => {
    let newPos = { ...currentPos };
    if (direction === "up") newPos.row -= 1;
    if (direction === "down") newPos.row += 1;
    if (direction === "left") newPos.col -= 1;
    if (direction === "right") newPos.col += 1;

    if (
      newPos.row < 0 ||
      newPos.row >= sampleMaze.length ||
      newPos.col < 0 ||
      newPos.col >= sampleMaze[0].length ||
      sampleMaze[newPos.row][newPos.col] === 1
    ) {
      return currentPos;
    }

    if (newPos.row === endPosition.row && newPos.col === endPosition.col) {
      setHasWon(true);
    }
    return newPos;
  };

  // --- FIXED: Shift+Enter Replay Logic ---
  const executeCommands = (commands) => {
    if (hasWon) return;

    // Reset player to the start immediately for visual feedback
    setPlayerPosition(startPosition);
    let currentPos = { ...startPosition };
    const moveDelay = 150; // ms between each move

    // Execute each command with a delay to create an animation
    commands.forEach((command, index) => {
      setTimeout(() => {
        currentPos = movePlayer(command, currentPos);
        setPlayerPosition(currentPos);
      }, moveDelay * (index + 1));
    });
  };

  const handleKeyDown = (e) => {
    if (hasWon) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const lines = code.split("\n");
      const lastLine = lines[lines.length - 1].trim();

      const commandMatch = lastLine.match(/^(up|down|left|right)\(\)$/);
      if (commandMatch) {
        const command = commandMatch[1];
        setPlayerPosition((prevPos) => movePlayer(command, prevPos));
      }
      setCode((prevCode) => prevCode + "\n");
    }

    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const lines = code.trim().split("\n");
      const commands = lines
        .map((line) => {
          const match = line.trim().match(/^(up|down|left|right)\(\)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean);
      executeCommands(commands);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <main className="flex flex-col md:flex-row h-screen w-full bg-background p-4 gap-4 relative">
      {/* --- NEW: Win Message Overlay --- */}
      {hasWon && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
          <h1 className="text-6xl font-bold text-accent animate-pulse">
            ACCESS GRANTED
          </h1>
          <p className="text-2xl text-foreground mt-4">
            Final Time: {formatTime(time)}
          </p>
        </div>
      )}

      <div
        ref={mazeContainerRef}
        className="relative flex-1 flex items-center justify-center border-2 border-border rounded-lg p-4 bg-black/30"
      >
        <Maze mazeData={sampleMaze} />
        {cellSize > 0 && (
          <Player position={playerPosition} cellSize={cellSize} />
        )}
      </div>

      <div className="flex-1 flex flex-col border-2 border-border rounded-lg p-2 bg-black/30 gap-2">
        <div className="flex justify-between items-center p-2 bg-black/50 rounded-md">
          <h2 className="text-lg font-bold text-accent tracking-widest">
            TIMER
          </h2>
          <span className="text-2xl font-bold text-foreground font-mono">
            {formatTime(time)}
          </span>
        </div>
        <CodeEditor code={code} setCode={setCode} onKeyDown={handleKeyDown} />
      </div>
    </main>
  );
};

export default GamePage;
