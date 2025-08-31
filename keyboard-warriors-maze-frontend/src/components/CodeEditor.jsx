// client/src/components/CodeEditor.jsx

import React, { useState } from "react";

/**
 * CodeEditor Component
 * @param {string} code - The current value of the editor.
 * @param {function} setCode - The function to update the code state.
 * @param {function} onKeyDown - The function to handle keydown events.
 * @param {boolean} isGameActive - Whether the game is currently active (practice or event mode).
 * @param {function} onBlockAction - Callback to trigger when an action is blocked.
 */
const CodeEditor = ({ code, setCode, onKeyDown, isGameActive, onBlockAction }) => {
  const [blockNotification, setBlockNotification] = useState('');

  const showBlockNotification = (action) => {
    setBlockNotification(`${action} blocked during game`);
    setTimeout(() => setBlockNotification(''), 2000);
    // Trigger parent warning banner
    if (onBlockAction) {
      onBlockAction();
    }
  };

  const handleTextareaKeyDown = (e) => {
    // Prevent copy-paste during game (both practice and event modes)
    if (isGameActive && e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'x' || e.key === 'z' || e.key === 'y')) {
      e.preventDefault();
      e.stopPropagation();
      const actionMap = {
        'c': 'Copy',
        'v': 'Paste', 
        'a': 'Select All',
        'x': 'Cut',
        'z': 'Undo',
        'y': 'Redo'
      };
      showBlockNotification(actionMap[e.key] || 'Action');
      return false;
    }
    // Call the original onKeyDown handler
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleTextareaPaste = (e) => {
    if (isGameActive) {
      e.preventDefault();
      showBlockNotification('Paste');
      return false;
    }
  };

  const handleTextareaCopy = (e) => {
    if (isGameActive) {
      e.preventDefault();
      showBlockNotification('Copy');
      return false;
    }
  };

  const handleTextareaCut = (e) => {
    if (isGameActive) {
      e.preventDefault();
      showBlockNotification('Cut');
      return false;
    }
  };
  return (
    <div className="w-full h-full bg-black rounded-md p-4 flex flex-col relative">
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
        onKeyDown={handleTextareaKeyDown}
        onPaste={handleTextareaPaste}
        onContextMenu={isGameActive ? (e) => e.preventDefault() : undefined}
        onCopy={handleTextareaCopy}
        onCut={handleTextareaCut}
        className="w-full flex-grow bg-transparent text-foreground font-code text-lg resize-none focus:outline-none placeholder-foreground/30"
        placeholder="Type your commands here...
left()
right()
up()
down()"
        spellCheck="false"
        style={isGameActive ? { 
          userSelect: 'text', 
          webkitUserSelect: 'text',
          mozUserSelect: 'text',
          msUserSelect: 'text'
        } : {}}
      />
      {blockNotification && (
        <div className="absolute top-4 right-4 bg-destructive text-white px-3 py-2 rounded-md text-sm font-bold animate-pulse z-50">
          {blockNotification}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
