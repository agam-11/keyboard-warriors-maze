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

const WinOverlay = ({ isEventLive }) => {
  useEffect(() => {
    if (isEventLive) {
      // Auto-logout after 5 seconds for main event completion
      const logoutTimer = setTimeout(() => {
        localStorage.removeItem("playerInfo");
        window.location.reload();
      }, 5000);
      
      return () => clearTimeout(logoutTimer);
    }
  }, [isEventLive]);

  return (
    <div className="absolute inset-0 bg-background z-20 flex items-center justify-center flex-col">
      <h1
        className="text-7xl font-extrabold text-accent animate-glitch"
        data-text={isEventLive ? "ACCESS GRANTED" : "PRACTICE COMPLETE"}
      >
        {isEventLive ? "ACCESS GRANTED" : "PRACTICE COMPLETE"}
      </h1>
      {isEventLive && (
        <p className="text-lg text-foreground mt-4 opacity-70">
          Redirecting in 5 seconds...
        </p>
      )}
    </div>
  );
};

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
  const [showWarningBanner, setShowWarningBanner] = useState(false);

  const mazeContainerRef = useRef(null);
  const cellSize = useRef(48);
  const hasSubmitted = useRef(false); // FIX: Add a ref to act as a submission lock
  const warningTimerRef = useRef(null);

  const [playerInfo] = useState(() =>
    JSON.parse(localStorage.getItem("playerInfo"))
  );

  const showWarningBannerTemporarily = useCallback(() => {
    // Clear any existing timer
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    
    setShowWarningBanner(true);
    warningTimerRef.current = setTimeout(() => {
      setShowWarningBanner(false);
      warningTimerRef.current = null;
    }, 5000);
  }, []);

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
        console.log("Event state data:", data);
        console.log("API_URL being used:", API_URL);

        if (data.hasCompleted) {
          console.log("Player has already completed the event");
          setIsEventLive(true);
          setHasWon(true);
          return;
        }

        setIsEventLive(data.isEventLive);
        console.log("Event is live:", data.isEventLive);

        if (data.isEventLive) {
          console.log("Setting up main event with maze:", data.maze);
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

  // Prevent copy-paste during game (both practice and event modes)
  useEffect(() => {
    // Always prevent copy-paste when playing the game
    if (!mazeData) return;

    const preventCopyPaste = (e) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X, Ctrl+Z, Ctrl+Y
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'x' || e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        e.stopPropagation();
        showWarningBannerTemporarily();
        console.log('Copy-paste prevented during game mode');
        return false;
      }
      // Prevent F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        showWarningBannerTemporarily();
        return false;
      }
      // Prevent Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        e.stopPropagation();
        showWarningBannerTemporarily();
        return false;
      }
      // Prevent Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        e.stopPropagation();
        showWarningBannerTemporarily();
        return false;
      }
      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        showWarningBannerTemporarily();
        return false;
      }
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
      showWarningBannerTemporarily();
      return false;
    };

    const preventPaste = (e) => {
      e.preventDefault();
      showWarningBannerTemporarily();
      return false;
    };

    const preventDragDrop = (e) => {
      e.preventDefault();
      showWarningBannerTemporarily();
      return false;
    };

    // Add event listeners to prevent copy-paste and developer tools
    document.addEventListener('keydown', preventCopyPaste, true);
    document.addEventListener('contextmenu', preventContextMenu, true);
    document.addEventListener('paste', preventPaste, true);
    document.addEventListener('dragover', preventDragDrop, true);
    document.addEventListener('drop', preventDragDrop, true);

    // Disable text selection during event
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    // Additional security measures
    document.body.style.pointerEvents = 'auto'; // Keep interactions but disable selection

    return () => {
      // Cleanup event listeners
      document.removeEventListener('keydown', preventCopyPaste, true);
      document.removeEventListener('contextmenu', preventContextMenu, true);
      document.removeEventListener('paste', preventPaste, true);
      document.removeEventListener('dragover', preventDragDrop, true);
      document.removeEventListener('drop', preventDragDrop, true);
      
      // Clear warning banner timer
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      
      // Restore text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, [mazeData, showWarningBannerTemporarily]);

  const submitScore = useCallback(async () => {
    console.log("submitScore called - checking conditions...");
    console.log("isEventLive:", isEventLive);
    console.log("playerInfo exists:", !!playerInfo);
    console.log("hasSubmitted:", hasSubmitted.current);
    
    if (!isEventLive || !playerInfo || hasSubmitted.current) {
      console.log("submitScore returning early due to conditions");
      return;
    }

    console.log("All conditions met, making API call...");

    try {
      console.log("Submitting score:", {
        playerName: playerInfo.name,
        contactNumber: playerInfo.contact,
        time: timer,
      });

      const response = await fetch(`${API_URL}/api/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: playerInfo.name,
          contactNumber: playerInfo.contact,
          time: timer,
        }),
      });
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const result = await response.json();
      console.log("Response body:", result);
      
      if (!response.ok) {
        console.error("Score submission failed:", result.error);
        if (response.status === 409) {
          console.log("Score already submitted for this player");
        }
        return;
      }

      // Only set the submission lock AFTER successful submission
      hasSubmitted.current = true;
      console.log("Score submitted successfully:", result);
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
          console.log("Player reached the end!");
          console.log("Event is live:", isEventLive);
          console.log("Has submitted:", hasSubmitted.current);
          console.log("Player info:", playerInfo);
          console.log("Timer:", timer);
          
          // FIX: Check the lock before submitting
          if (!hasSubmitted.current) {
            setHasWon(true);
            if (isEventLive) {
              console.log("Submitting score because event is live");
              console.log("About to call submitScore function...");
              
              // Call submitScore and handle the promise
              submitScore()
                .then(() => {
                  console.log("submitScore completed successfully");
                })
                .catch((error) => {
                  console.error("submitScore failed:", error);
                });
            } else {
              console.log("Not submitting score - event is not live (practice mode)");
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

  const handleLogout = () => {
    localStorage.removeItem("playerInfo");
    window.location.reload(); // Reload to show RegisterPage
  };

  if (hasWon) {
    return <WinOverlay isEventLive={isEventLive} />;
  }

  return (
    <div
      className={`flex flex-col md:flex-row h-screen bg-background text-foreground p-4 gap-4 scanlines relative ${
        shake ? "animate-shake" : ""
      }`}
    >
      {showWarningBanner && (
        <div className="absolute top-0 left-0 right-0 bg-destructive text-white text-center py-2 px-4 z-30 font-bold animate-pulse transform transition-transform duration-300 ease-out">
          🚫 GAME MODE: Copy-paste, right-click, and developer tools are disabled
        </div>
      )}
      <div
        ref={mazeContainerRef}
        className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center p-4 border-2 border-primary rounded-md"
        style={showWarningBanner ? { marginTop: '3rem' } : {}}
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

      <div 
        className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col gap-4"
        style={showWarningBanner ? { marginTop: '3rem' } : {}}
      >
        <div className="flex justify-between items-center p-2 border-2 border-muted rounded-md bg-black/30">
          <div className="flex items-center gap-4">
            <span className="text-accent font-bold tracking-widest">
              {isEventLive ? "MAIN EVENT" : "PRACTICE MODE"}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 text-foreground font-bold tracking-wider border border-border rounded transition-all duration-200 hover:shadow-[0_0_8px_rgba(75,0,130,0.5)] uppercase"
            >
              LOGOUT
            </button>
          </div>
          <span className="text-primary font-code text-2xl">
            {isEventLive
              ? new Date(timer * 1000).toISOString().substr(14, 5)
              : "00:00"}
          </span>
        </div>
        <CodeEditor 
          code={code} 
          setCode={setCode} 
          onKeyDown={handleKeyDown} 
          isGameActive={!!mazeData}
          onBlockAction={showWarningBannerTemporarily}
        />
      </div>
    </div>
  );
};

export default GamePage;
