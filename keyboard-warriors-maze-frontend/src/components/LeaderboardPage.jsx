// client/src/components/LeaderboardPage.jsx

import React, { useState, useEffect } from "react";

// The API endpoint for our Express server
const API_URL = "http://localhost:3001";

/**
 * LeaderboardPage Component
 * Fetches and displays the top scores from the server.
 */
const LeaderboardPage = () => {
  const [scores, setScores] = useState([]);
  const [error, setError] = useState("");

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/leaderboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data.");
      }
      const data = await response.json();
      // For now, we'll display user_id. We'll replace this with emails/usernames later.
      setScores(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  // Fetch data on component mount and then poll every 5 seconds
  useEffect(() => {
    fetchLeaderboard(); // Initial fetch
    const interval = setInterval(fetchLeaderboard, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="w-full h-screen bg-background p-8 flex flex-col items-center">
      <h1 className="text-5xl font-bold text-accent tracking-widest mb-8 animate-pulse">
        LEADERBOARD
      </h1>

      {error && <p className="text-destructive">{error}</p>}

      <div className="w-full max-w-4xl bg-black/30 border-2 border-border rounded-lg p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-muted">
              <th className="p-4 text-primary text-lg">RANK</th>
              <th className="p-4 text-primary text-lg">WARRIOR ID</th>
              <th className="p-4 text-primary text-lg text-right">TIME</th>
            </tr>
          </thead>
          <tbody>
            {scores.length > 0 ? (
              scores.map((score, index) => (
                <tr
                  key={score.user_id + index}
                  className="border-b border-muted/50"
                >
                  <td className="p-4 text-2xl font-bold">{index + 1}</td>
                  {/* We truncate the long user_id for display purposes */}
                  <td className="p-4 font-mono">
                    {score.user_id.substring(0, 8)}...
                  </td>
                  <td className="p-4 font-mono text-2xl text-right">
                    {formatTime(score.finish_time_seconds)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-8 text-center text-foreground/50">
                  No scores submitted yet...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
