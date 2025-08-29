import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Helper function to format time from seconds to MM:SS
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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_URL}/api/leaderboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data.");
        }
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard(); // Fetch initially
    const interval = setInterval(fetchLeaderboard, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
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
      <h1 className="text-5xl font-extrabold text-center text-primary mb-8 tracking-widest">
        LEADERBOARD
      </h1>
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
                  {/* FIX: Safely access the email */}
                  {entry.profiles?.email || "Anonymous"}
                </td>
                <td className="p-4 text-center font-code text-primary text-2xl">
                  {/* FIX: Safely format the time */}
                  {formatTime(entry.finish_time_seconds)}
                </td>
                <td className="p-4 text-center text-foreground/50 text-sm hidden md:table-cell">
                  {/* FIX: Safely format the date, providing a fallback */}
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
