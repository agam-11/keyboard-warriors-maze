// client/src/components/CodeEditor.jsx

import React from "react";

/**
 * CodeEditor Component
 * @param {string} code - The current value of the editor.
 * @param {function} setCode - The function to update the code state.
 * @param {function} onKeyDown - The function to handle keydown events.
 */
const CodeEditor = ({ code, setCode, onKeyDown }) => {
  return (
    <div className="w-full h-full bg-black rounded-md p-4 flex flex-col">
      <div className="flex items-center pb-2 border-b-2 border-muted mb-2">
        <div className="w-3 h-3 rounded-full bg-destructive mr-2"></div>
        <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-auto text-muted font-bold text-xs tracking-widest">
          TERMINAL
        </span>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown} // Attach the event handler here
        className="w-full flex-grow bg-transparent text-foreground font-code text-lg resize-none focus:outline-none placeholder-foreground/30"
        placeholder="Type your commands here...
left()
right()
up()
down()"
        spellCheck="false"
      />
    </div>
  );
};

export default CodeEditor;
