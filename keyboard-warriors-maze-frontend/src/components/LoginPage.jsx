// client/src/components/LoginPage.jsx

import React, { useState } from "react";

const API_URL = "http://localhost:3001";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      // On successful login, save the token and refresh the page
      localStorage.setItem("supabase-token", data.session.access_token);
      window.location.reload(); // Reload to let App.jsx detect the session
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background scanlines">
      <div className="w-full max-w-md p-8 space-y-8 bg-black/30 border-2 border-border rounded-lg">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-primary tracking-widest">
            KEYBOARD WARRIORS
          </h2>
          <p className="mt-2 text-center text-sm text-foreground/70">
            Authenticate to begin the challenge
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-muted bg-background placeholder-foreground/50 text-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm rounded-t-md"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-muted bg-background placeholder-foreground/50 text-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm rounded-b-md"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-destructive text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-background bg-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
