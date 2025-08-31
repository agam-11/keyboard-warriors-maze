import React, { useState } from "react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    // We only proceed if the name field isn't just empty spaces
    if (name.trim()) {
      // Save the player's info to localStorage
      localStorage.setItem(
        "playerInfo",
        JSON.stringify({ name: name.trim(), contact })
      );
      // Reload the page. App.jsx will see the new info and show the game.
      window.location.reload();
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
            Enter your details to begin the challenge
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="player-name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-muted bg-background placeholder-foreground/50 text-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm rounded-t-md"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                id="contact-number"
                name="contact"
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-muted bg-background placeholder-foreground/50 text-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm rounded-b-md"
                placeholder="Contact Number (Optional)"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-background bg-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Start Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
