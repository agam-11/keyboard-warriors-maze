// client/src/App.jsx

import React from "react";
import GamePage from "./components/GamePage";
import LeaderboardPage from "./components/LeaderboardPage";
import LoginPage from "./components/LoginPage"; // Import the new LoginPage

function App() {
  const token = localStorage.getItem("supabase-token");

  // If no token, force user to log in
  if (!token) {
    return <LoginPage />;
  }

  // If logged in, show the correct page based on the URL
  const path = window.location.pathname;

  if (path === "/leaderboard") {
    return <LeaderboardPage />;
  }

  return <GamePage />;
}

export default App;
