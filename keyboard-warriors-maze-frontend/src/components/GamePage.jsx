import React, { useState, useEffect, useCallback, useRef } from "react";
import Maze from "./Maze";
import CodeEditor from "./CodeEditor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const practiceMaze = [
  ["S", 0, 1, 0, 0, 1, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, "E"],
];

const WinOverlay = ({ isEventLive }) => (
  <div className="absolute inset-0 bg-background z-20 flex items-center justify-center">
    <h1
      className="text-7xl font-extrabold text-accent animate-glitch"
      data-text={isEventLive ? "ACCESS GRANTED" : "PRACTICE COMPLETE"}
    >
      {isEventLive ? "ACCESS GRANTED" : "PRACTICE COMPLETE"}
    </h1>
  </div>
);

const GamePage = () => {
  const [mazeData, setMazeData] = useState(null);
  const [playerPosition, setPlayerPosition] = useState(null);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [code, setCode] = useState("");
  const [hasWon, setHasWon] = useState(false);
  const [isEventLive, setIsEventLive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [shake, setShake] = useState(false);

  const mazeContainerRef = useRef(null);
  const cellSize = useRef(48);
  const hasSubmitted = useRef(false); // FIX: Add a ref to act as a submission lock

  const [playerInfo] = useState(() =>
    JSON.parse(localStorage.getItem("playerInfo"))
  );

  useEffect(() => {
    const fetchEventState = async () => {
      // Use the new playerInfo object
      if (!playerInfo) return;

      try {
        // CHANGE 2: Send player name in a POST request body
        const response = await fetch(`${API_URL}/api/event-state`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerName: playerInfo.name }),
        });
        if (!response.ok) throw new Error("Failed to fetch event state");
        const data = await response.json();

        if (data.hasCompleted) {
          setIsEventLive(true);
          setHasWon(true);
          return;
        }

        setIsEventLive(data.isEventLive);

        if (data.isEventLive) {
          setMazeData(data.maze);
          const startTime = new Date(data.startTime).getTime();
          const updateTimer = () => {
            const now = new Date().getTime();
            const elapsed = Math.floor((now - startTime) / 1000);
            setTimer(elapsed > 0 ? elapsed : 0);
          };
          updateTimer();
          const interval = setInterval(updateTimer, 1000);
          return () => clearInterval(interval);
        } else {
          setMazeData(practiceMaze);
        }
      } catch (error) {
        console.error("Error fetching event state:", error);
        setMazeData(practiceMaze);
      }
    };
    fetchEventState();
  }, [playerInfo]);

  useEffect(() => {
    if (!mazeData) return;
    let start = null;
    let end = null;
    for (let r = 0; r < mazeData.length; r++) {
      for (let c = 0; c < mazeData[r].length; c++) {
        if (mazeData[r][c] === "S") start = { row: r, col: c };
        if (mazeData[r][c] === "E") end = { row: r, col: c };
      }
    }
    setStartPosition(start);
    setEndPosition(end);
    setPlayerPosition(start);
  }, [mazeData]);

  const handleResize = useCallback(() => {
    if (mazeContainerRef.current && mazeData) {
      // Get the actual size of a rendered maze cell
      const mazeElement = mazeContainerRef.current.querySelector('.grid');
      if (mazeElement) {
        const firstCell = mazeElement.children[0];
        if (firstCell) {
          const cellRect = firstCell.getBoundingClientRect();
          cellSize.current = cellRect.width;
          setPlayerPosition((prev) => ({ ...prev }));
          return;
        }
      }
      
      // Fallback to calculated size if DOM measurement fails
      const containerWidth = mazeContainerRef.current.offsetWidth;
      const totalGaps = (mazeData[0].length - 1) * 1; // 1px gap between cells
      const availableWidth = containerWidth - totalGaps;
      const newCellSize = availableWidth / mazeData[0].length;
      cellSize.current = newCellSize;
      setPlayerPosition((prev) => ({ ...prev }));
    }
  }, [mazeData]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const submitScore = useCallback(async () => {
    if (!isEventLive || !playerInfo || hasSubmitted.current) return;
    hasSubmitted.current = true;

    try {
      // CHANGE 3: Send player info in the request body instead of a token
      await fetch(`${API_URL}/api/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: playerInfo.name,
          contactNumber: playerInfo.contact,
          time: timer,
        }),
      });
    } catch (error) {
      console.error("Failed to submit score:", error);
    }
  }, [isEventLive, timer, playerInfo]);

  const movePlayer = useCallback(
    (direction) => {
      if (hasWon || !playerPosition) return;

      setPlayerPosition((prevPos) => {
        const newPos = { ...prevPos };
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
          setShake(true);
          setTimeout(() => setShake(false), 300);
          return prevPos;
        }

        if (
          endPosition &&
          newPos.row === endPosition.row &&
          newPos.col === endPosition.col
        ) {
          // FIX: Check the lock before submitting
          if (!hasSubmitted.current) {
            hasSubmitted.current = true; // Set the lock immediately
            setHasWon(true);
            if (isEventLive) {
              // Only submit score if it's the main event
              submitScore();
            }
          }
        }
        return newPos;
      });
    },
    [hasWon, playerPosition, mazeData, endPosition, submitScore, isEventLive]
  );

  const executeCommands = useCallback(
    (commands, isReplay = false) => {
      if (!startPosition) return;

      if (!isReplay) {
        const command = commands[0];
        if (["up", "down", "left", "right"].includes(command)) {
          movePlayer(command);
        }
        return;
      }

      setPlayerPosition(startPosition);

      const commandQueue = [...commands];
      const interval = setInterval(() => {
        if (commandQueue.length === 0) {
          clearInterval(interval);
          return;
        }
        const command = commandQueue.shift();
        if (["up", "down", "left", "right"].includes(command)) {
          setPlayerPosition((prevPos) => {
            const newPos = { ...prevPos };
            if (command === "up") newPos.row -= 1;
            if (command === "down") newPos.row += 1;
            if (command === "left") newPos.col -= 1;
            if (command === "right") newPos.col += 1;

            if (
              mazeData &&
              newPos.row >= 0 &&
              newPos.row < mazeData.length &&
              newPos.col >= 0 &&
              newPos.col < mazeData[0].length &&
              mazeData[newPos.row][newPos.col] !== 1
            ) {
              return newPos;
            }
            return prevPos;
          });
        }
      }, 50);
    },
    [movePlayer, startPosition, mazeData]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const lines = code.split("\n");
        const lastLine = lines[lines.length - 1]?.trim();

        if (!lastLine) {
          setCode((prev) => prev + "\n");
          return;
        }

        if (e.shiftKey) {
          const allCommands = lines
            .map((line) => line.match(/(\w+)\(\)/)?.[1])
            .filter(Boolean);
          executeCommands(allCommands, true);
        } else {
          const command = lastLine.match(/(\w+)\(\)/)?.[1];
          if (command) {
            executeCommands([command]);
            setCode((prev) => prev + "\n");
          }
        }
      }
    },
    [code, executeCommands]
  );

  if (hasWon) {
    return <WinOverlay isEventLive={isEventLive} />;
  }

  return (
    <div
      className={`flex flex-col md:flex-row h-screen bg-background text-foreground p-4 gap-4 scanlines ${
        shake ? "animate-shake" : ""
      }`}
    >
      <div
        ref={mazeContainerRef}
        className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center p-4 border-2 border-primary rounded-md"
      >
        {mazeData && playerPosition && (
          <div
            className="relative"
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "calc(100vh - 6rem)",
              maxHeight: "calc(100vw - 6rem)",
              aspectRatio: `${mazeData[0].length}/${mazeData.length}`,
            }}
          >
            <Maze mazeData={mazeData} playerPosition={playerPosition} />
          </div>
        )}
      </div>

      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col gap-4">
        <div className="flex justify-between items-center p-2 border-2 border-muted rounded-md bg-black/30">
          <span className="text-accent font-bold tracking-widest">
            {isEventLive ? "MAIN EVENT" : "PRACTICE MODE"}
          </span>
          <span className="text-primary font-code text-2xl">
            {isEventLive
              ? new Date(timer * 1000).toISOString().substr(14, 5)
              : "00:00"}
          </span>
        </div>
        <CodeEditor code={code} setCode={setCode} onKeyDown={handleKeyDown} />
      </div>
    </div>
  );
};

export default GamePage;
