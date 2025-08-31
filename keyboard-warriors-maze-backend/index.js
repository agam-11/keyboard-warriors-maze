require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Hardcoded Maze Collection ---
const mazes = {
  1: [
    ["S", 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, "E"],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  2: [
    ["S", 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, "E"],
  ],
  3: [
    [1, 1, 1, 1, 1, 1, "E"],
    [1, 0, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1],
    ["S", 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  4: [
    ["S", 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, "E"],
  ],
};

// --- API Endpoints ---
app.post("/api/event-state", async (req, res) => {
  const { playerName } = req.body;
  try {
    const { data: eventData, error: eventError } = await supabase
      .from("event_control")
      .select("*")
      .single();
    if (eventError) throw eventError;

    const isEventLive = !eventData.is_practice_active;
    let hasCompleted = false;

    if (isEventLive && playerName) {
      const { data: scoreData, error: scoreError } = await supabase
        .from("leaderboard")
        .select("id")
        .eq("player_name", playerName)
        .limit(1);
      if (scoreError) throw scoreError;
      hasCompleted = scoreData && scoreData.length > 0;
    }

    const mazeNumber = eventData.selected_maze_number || 1;
    const selectedMaze = mazes[mazeNumber];

    res.json({
      isEventLive,
      startTime: eventData.main_event_start_time,
      maze: selectedMaze,
      hasCompleted,
    });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch event state." });
  }
});

app.post("/api/finish", async (req, res) => {
  const { playerName, contactNumber, time } = req.body;
  if (!playerName || typeof time === "undefined") {
    return res
      .status(400)
      .json({ error: "Player name and time are required." });
  }

  try {
    const { data: existing, error: checkError } = await supabase
      .from("leaderboard")
      .select("id")
      .eq("player_name", playerName)
      .limit(1);

    if (checkError) throw checkError;
    if (existing && existing.length > 0) {
      return res
        .status(409)
        .json({ error: "Score already submitted for this player." });
    }

    const { error } = await supabase.from("leaderboard").insert([
      {
        player_name: playerName,
        contact_number: contactNumber,
        finish_time_seconds: time,
      },
    ]);
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Could not save score." });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("player_name, finish_time_seconds, created_at")
    .order("finish_time_seconds", { ascending: true })
    .limit(20);

  if (error) {
    return res.status(500).json({ error: "Could not fetch leaderboard." });
  }
  res.json(data);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
