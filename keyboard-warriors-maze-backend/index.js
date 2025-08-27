// server/index.js

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// --- 1. INITIAL SETUP ---
const app = express();
const PORT = process.env.PORT || 3001;

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 3. SUPABASE CLIENT ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("Supabase client initialized successfully.");

// --- 4. API ENDPOINTS ---

app.get("/", (req, res) => {
  res.send("Keyboard Warriors API is running!");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return res.status(401).json({ error: "Invalid login credentials." });
    }
    res.status(200).json({ session: data.session });
  } catch (err) {
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// --- NEW ENDPOINTS ---

/**
 * GET /api/event-state
 * Fetches the current state of the event from the 'event_control' table.
 * This is public data that anyone can read.
 */
app.get("/api/event-state", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("event_control")
      .select("*")
      .eq("id", 1) // Select the single row
      .single(); // Expect only one result

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching event state:", error.message);
    res.status(500).json({ error: "Failed to fetch event state." });
  }
});

/**
 * GET /api/leaderboard
 * Fetches the top scores from the leaderboard.
 * This is public data.
 */
app.get("/api/leaderboard", async (req, res) => {
  try {
    // Note: We need to set up an RPC function in Supabase for this to work with user emails
    // For now, we'll just get the user_id.
    const { data, error } = await supabase
      .from("leaderboard")
      .select("user_id, finish_time_seconds")
      .order("finish_time_seconds", { ascending: true })
      .limit(20);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    res.status(500).json({ error: "Failed to fetch leaderboard." });
  }
});

/**
 * POST /api/finish
 * Submits a user's final time to the leaderboard.
 * This is a protected action and requires a valid user session.
 */
app.post("/api/finish", async (req, res) => {
  const { time, token } = req.body;

  if (!time || !token) {
    return res.status(400).json({ error: "Time and user token are required." });
  }

  try {
    // 1. Authenticate the user with the provided token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    // 2. Insert the score into the leaderboard
    const { error: insertError } = await supabase
      .from("leaderboard")
      .insert({ user_id: user.id, finish_time_seconds: time });

    if (insertError) throw insertError;

    res.status(200).json({ message: "Score submitted successfully!" });
  } catch (error) {
    console.error("Error submitting score:", error.message);
    res.status(500).json({ error: "Failed to submit score." });
  }
});

// --- 5. START SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
