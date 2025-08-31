import React, { useState, useEffect, useCallback, useRef } from "react";
import Maze from "./Maze";
import CodeEditor from "./CodeEditor";
import Player from "./Player";

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
  // CHANGE 1: Get player info from localStorage instead of a token.
  const [playerInfo] = useState(() =>
    JSON.parse(localStorage.getItem("playerInfo"))
  );

  const [mazeData, setMazeData] = useState(practiceMaze); // Default to practice
  const [playerPosition, setPlayerPosition] = useState(null);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [code, setCode] = useState("");
  const [hasWon, setHasWon] = useState(false);
  const [isEventLive, setIsEventLive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [shake, setShake] = useState(false);
  const hasSubmitted = useRef(false);
  const mazeContainerRef = useRef(null);
  const cellSize = useRef(48);

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
    let start = null,
      end = null;
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
      const newCellSize =
        mazeContainerRef.current.offsetWidth / mazeData[0].length;
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
          if (!hasSubmitted.current) {
            hasSubmitted.current = true;
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

  const executeCommands = useCallback(/* ... no changes needed here ... */);
  const handleKeyDown = useCallback(/* ... no changes needed here ... */);

  if (hasWon) {
    return <WinOverlay isEventLive={isEventLive} />;
  }

  // ... The entire return (...) block with your JSX layout remains exactly the same ...
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
            <Maze mazeData={mazeData} />
            <Player position={playerPosition} cellSize={cellSize.current} />
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
