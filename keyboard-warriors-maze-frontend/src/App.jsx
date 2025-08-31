import React from "react";
import GamePage from "./components/GamePage";
import LeaderboardPage from "./components/LeaderboardPage";
import RegisterPage from "./components/RegisterPage"; // Import the new RegisterPage

function App() {
  // Check for player information in local storage instead of a token.
  const playerInfo = localStorage.getItem("playerInfo");

  // If there is no player information, the user must register first.
  if (!playerInfo) {
    return <RegisterPage />;
  }

  // If the user has registered, show the correct page based on the URL.
  const path = window.location.pathname;
  if (path === "/leaderboard") {
    return <LeaderboardPage />;
  }

  // By default, show the game page.
  return <GamePage />;
}

export default App;
