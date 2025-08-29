require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

// --- Server and Supabase Setup ---
const app = express();

// --- FIX: Configure CORS to allow the Authorization header ---
const corsOptions = {
  origin: "*", // In production, you should restrict this to your frontend's domain
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"], // Explicitly allow Authorization
};
app.use(cors(corsOptions));

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

if (supabase) {
  console.log("Supabase client initialized successfully.");
} else {
  console.error("Failed to initialize Supabase client.");
}

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
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(401).json({ error: error.message });
  }
});

app.get("/api/event-state", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided." });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) {
      console.error("Auth Error on /event-state:", userError.message);
      return res.status(401).json({ error: "Invalid token." });
    }

    const { data: eventData, error: eventError } = await supabase
      .from("event_control")
      .select("*")
      .single();
    if (eventError) throw eventError;

    const isEventLive = !eventData.is_practice_active;
    let hasCompleted = false;

    if (isEventLive) {
      const { data: scoreData, error: scoreError } = await supabase
        .from("leaderboard")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);
      if (scoreError) throw scoreError;
      if (scoreData && scoreData.length > 0) {
        hasCompleted = true;
      }
    }

    const mazeNumber = eventData.selected_maze_number;
    const selectedMaze = mazes[mazeNumber] || mazes[1];

    res.json({
      isEventLive,
      startTime: eventData.main_event_start_time,
      maze: selectedMaze,
      hasCompleted,
    });
  } catch (error) {
    console.error("Event State Error:", error.message);
    res.status(500).json({ error: "Could not fetch event state." });
  }
});

app.post("/api/finish", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided." });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error("Auth Error on /finish:", userError.message);
      return res.status(401).json({ error: "Invalid token." });
    }

    // Check if user has already submitted a score
    const { data: existingScore, error: checkError } = await supabase
      .from("leaderboard")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (checkError) throw checkError;
    if (existingScore && existingScore.length > 0) {
      return res.status(409).json({ error: "Score already submitted." });
    }

    const { time } = req.body;
    const { error: insertError } = await supabase
      .from("leaderboard")
      .insert([{ user_id: user.id, finish_time_seconds: time }]);

    if (insertError) throw insertError;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Finish API Error:", error);
    res.status(500).json({ error: "Could not save score." });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("finish_time_seconds, created_at, profiles ( email )")
      .order("finish_time_seconds", { ascending: true })
      .limit(20);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ error: "Could not fetch leaderboard." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
