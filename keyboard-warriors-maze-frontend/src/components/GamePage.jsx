// client/src/components/GamePage.jsx

import React, { useState, useMemo, useRef, useEffect } from "react";
import Maze from "./Maze";
import CodeEditor from "./CodeEditor";
import Player from "./Player";

const API_URL = "https://keyboard-warriors-kdgf.onrender.com";

const practiceMaze = [
  ["S", 0, 1, 0, 0],
  [1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1],
  [0, 0, 0, 0, "E"],
];

const mainMaze = [
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

const findPosition = (maze, char) => {
  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[r].length; c++) {
      if (maze[r][c] === char) return { row: r, col: c };
    }
  }
  return null;
};

// Helper component for the win screen
const WinOverlay = ({ isEventLive, time }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const message = isEventLive ? "ACCESS GRANTED" : "PRACTICE COMPLETE";

  return (
    <div className="w-full h-screen relative overflow-hidden bg-background flex flex-col items-center justify-center ">
      <h1
        className="text-6xl font-bold text-accent animate-glitch"
        data-text={message}
      >
        {message}
      </h1>
      {isEventLive && (
        <p className="text-2xl text-foreground mt-4">
          Final Time: {formatTime(time)}
        </p>
      )}
    </div>
  );
};

const GamePage = () => {
  const [code, setCode] = useState("");
  const [mazeData, setMazeData] = useState(practiceMaze);

  const startPosition = useMemo(() => findPosition(mazeData, "S"), [mazeData]);
  const endPosition = useMemo(() => findPosition(mazeData, "E"), [mazeData]);

  const [playerPosition, setPlayerPosition] = useState(startPosition);
  const mazeContainerRef = useRef(null);
  const [cellSize, setCellSize] = useState(0);

  const [hasWon, setHasWon] = useState(false);
  const [time, setTime] = useState(0);
  const [isEventLive, setIsEventLive] = useState(false);
  const [isColliding, setIsColliding] = useState(false);

  useEffect(() => {
    const fetchEventState = async () => {
      try {
        const response = await fetch(`${API_URL}/api/event-state`);
        const state = await response.json();

        if (!state.is_practice_active) {
          setMazeData(mainMaze);
          setIsEventLive(true);
        }
      } catch (error) {
        console.error("Failed to fetch event state:", error);
      }
    };
    fetchEventState();
  }, []);

  useEffect(() => {
    setPlayerPosition(findPosition(mazeData, "S"));
  }, [mazeData]);

  useEffect(() => {
    let timerInterval;
    if (isEventLive && !hasWon) {
      timerInterval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isEventLive, hasWon]);

  useEffect(() => {
    const calculateCellSize = () => {
      if (mazeContainerRef.current) {
        const mazeWidth = mazeContainerRef.current.offsetWidth;
        setCellSize(mazeWidth / mazeData[0].length);
      }
    };
    calculateCellSize();
    window.addEventListener("resize", calculateCellSize);
    return () => window.removeEventListener("resize", calculateCellSize);
  }, [mazeData]);

  const submitScore = async (finalTime) => {
    const token = localStorage.getItem("supabase-token");
    if (!token) {
      console.error("Not logged in. Cannot submit score.");
      return;
    }
    try {
      await fetch(`${API_URL}/api/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: finalTime, token: token }),
      });
    } catch (error) {
      console.error("Failed to submit score:", error);
    }
  };

  const triggerCollision = () => {
    setIsColliding(true);
    setTimeout(() => setIsColliding(false), 300);
  };

  const movePlayer = (direction, currentPos) => {
    let newPos = { ...currentPos };
    if (direction === "up") newPos.row -= 1;
    if (direction === "down") newPos.row += 1;
    if (direction === "left") newPos.col -= 1;
    if (direction === "right") newPos.col += 1;

    if (
      newPos.row < 0 ||
      newPos.row >= mazeData.length ||
      newPos.col < 0 ||
      newPos.col >= mazeData[0].length ||
      mazeData[newPos.row][newPos.col] === 1
    ) {
      triggerCollision();
      return currentPos;
    }

    if (newPos.row === endPosition.row && newPos.col === endPosition.col) {
      setHasWon(true);
      if (isEventLive) {
        submitScore(time + 1);
      }
    }
    return newPos;
  };

  const executeCommands = (commands) => {
    if (hasWon) return;
    setPlayerPosition(startPosition);
    let currentPos = { ...startPosition };
    const moveDelay = 150;

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

  // If the player has won, show the overlay.
  if (hasWon) {
    return <WinOverlay isEventLive={isEventLive} time={time} />;
  }

  // Otherwise, show the main game view.
  return (
    <div
      className={`w-full h-screen bg-background ${
        isColliding ? "animate-shake" : ""
      }`}
    >
      <main className="flex flex-col md:flex-row h-full w-full p-4 gap-4">
        <div
          ref={mazeContainerRef}
          className="relative flex-1 flex items-center justify-center border-2 border-border rounded-lg p-4 bg-black/30"
        >
          <Maze mazeData={mazeData} />
          {cellSize > 0 && playerPosition && (
            <Player position={playerPosition} cellSize={cellSize} />
          )}
        </div>

        <div className="flex-1 flex flex-col border-2 border-border rounded-lg p-2 bg-black/30 gap-2">
          <div className="flex justify-between items-center p-2 bg-black/50 rounded-md">
            <h2 className="text-lg font-bold text-accent tracking-widest">
              {isEventLive ? "TIMER" : "PRACTICE MODE"}
            </h2>
            <span className="text-2xl font-bold text-foreground font-mono">
              {formatTime(time)}
            </span>
          </div>
          <CodeEditor code={code} setCode={setCode} onKeyDown={handleKeyDown} />
        </div>
      </main>
    </div>
  );
};

export default GamePage;
