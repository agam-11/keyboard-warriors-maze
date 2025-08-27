// client/src/App.jsx

import React from "react";
import GamePage from "./components/GamePage";
import LeaderboardPage from "./components/LeaderboardPage";

function App() {
  const path = window.location.pathname;

  // Render the LeaderboardPage if the URL path is /leaderboard
  if (path === "/leaderboard") {
    return <LeaderboardPage />;
  }

  // Otherwise, default to showing the GamePage
  return <GamePage />;
}

export default App;
