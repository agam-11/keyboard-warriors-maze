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
    ["S", 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "E"],
  ],

  // Maze 2: "The Gridlock" - A symmetrical-looking layout with many parallel paths designed to confuse.
  2: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    ["S", 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, "E"],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],

  // Maze 3: "The Labyrinth" - Very few straight lines. Lots of tight turns and a large central block to navigate around.
  3: [
    [1, 1, 1, 1, 1, "S", 0, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, "E", 1, 1],
  ],

  // Maze 4: "The Gauntlet" - A massive 15x15 beast with long, narrow corridors that demand precision.
  4: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, "E", 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    ["S", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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

    console.log("Event control data:", eventData);
    console.log("Event control error:", eventError);

    if (eventError) {
      console.error("Error fetching event control:", eventError);
      // If no event control data, default to practice mode
      return res.json({
        isEventLive: false,
        startTime: null,
        maze: mazes[1], // Default maze
        hasCompleted: false,
      });
    }

    const isEventLive = !eventData.is_practice_active;
    console.log(
      "Is event live:",
      isEventLive,
      "Practice active:",
      eventData.is_practice_active
    );

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
  console.log("Score submission received:", {
    playerName,
    contactNumber,
    time,
  });

  if (!playerName || typeof time === "undefined") {
    console.log("Invalid submission - missing playerName or time");
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

    if (checkError) {
      console.error("Error checking existing scores:", checkError);
      throw checkError;
    }

    if (existing && existing.length > 0) {
      console.log("Score already exists for player:", playerName);
      return res
        .status(409)
        .json({ error: "Score already submitted for this player." });
    }

    console.log("Inserting new score for:", playerName);
    const { error } = await supabase.from("leaderboard").insert([
      {
        player_name: playerName,
        contact_number: contactNumber,
        finish_time_seconds: time,
      },
    ]);

    if (error) {
      console.error("Error inserting score:", error);
      throw error;
    }

    console.log("Score inserted successfully for:", playerName);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Score submission error:", error);
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
