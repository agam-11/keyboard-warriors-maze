import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Helper function to format time from seconds to a MM:SS string
const formatTime = (totalSeconds) => {
  if (typeof totalSeconds !== "number" || totalSeconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Manual refresh function for debugging
  const manualRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Manual refresh - fetching from:", `${API_URL}/api/leaderboard`);
      const response = await fetch(`${API_URL}/api/leaderboard`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Manual refresh - data received:", data);
      setLeaderboard(data);
    } catch (err) {
      console.error("Manual refresh error:", err);
      setError(`Manual refresh failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        console.log("Fetching leaderboard from:", `${API_URL}/api/leaderboard`);
        console.log("API_URL value:", API_URL);
        
        const response = await fetch(`${API_URL}/api/leaderboard`, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
        });
        
        console.log("Leaderboard response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Leaderboard fetch failed:", errorText);
          throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Leaderboard data received:", data);
        console.log("Number of entries:", data.length);
        setLeaderboard(data);
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard(); // Fetch the data immediately on component load
    const interval = setInterval(fetchLeaderboard, 5000); // Set up polling to refresh every 5 seconds

    return () => clearInterval(interval); // Clean up the interval when the component is unmounted
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-primary">
        Loading Leaderboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-destructive">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 scanlines">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-extrabold text-primary tracking-widest">
          LEADERBOARD
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={manualRefresh}
            disabled={loading}
            className="px-4 py-2 bg-primary hover:bg-accent text-background font-bold tracking-wider border border-border rounded transition-all duration-200 hover:shadow-[0_0_8px_rgba(255,140,0,0.5)] uppercase disabled:opacity-50"
          >
            {loading ? "..." : "[REFRESH]"}
          </button>
          <span className="text-xs text-muted">
            API: {API_URL} | Entries: {leaderboard.length}
          </span>
        </div>
      </div>
      <div className="max-w-4xl mx-auto overflow-hidden border-2 border-primary rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-primary/20 text-accent uppercase tracking-wider text-sm">
            <tr>
              <th className="p-4 text-center">Rank</th>
              <th className="p-4">Player</th>
              <th className="p-4 text-center">Time</th>
              <th className="p-4 text-center hidden md:table-cell">
                Submitted
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index} className="border-b border-muted last:border-b-0">
                <td className="p-4 text-center font-code text-2xl">
                  {index + 1}
                </td>
                <td className="p-4 text-left text-foreground font-bold">
                  {entry.player_name || "Anonymous"}
                </td>
                <td className="p-4 text-center font-code text-primary text-2xl">
                  {formatTime(entry.finish_time_seconds)}
                </td>
                <td className="p-4 text-center text-foreground/50 text-sm hidden md:table-cell">
                  {entry.created_at
                    ? new Date(entry.created_at).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
