"use client";

import React, { useState, useEffect } from "react";

export default function DebugFormPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [email, setEmail] = useState("");

  const addLog = (msg: string) => {
    setLogs((prev) => [
      `${new Date().toISOString().split("T")[1]} - ${msg}`,
      ...prev,
    ]);
    console.log(msg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLog("Submit event triggered!");
    alert("Form Submitted!");
  };

  const handleTouchStart = () => {
    addLog("Touch Start on Button");
  };

  const handleTouchEnd = () => {
    addLog("Touch End on Button");
  };

  const handleClick = () => {
    addLog("Click event on Button");
  };

  useEffect(() => {
    addLog("Page mounted");
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-8">
      <h1 className="mb-6 text-2xl font-bold">Mobile Form Debug</h1>

      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Test Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
              required
            />
          </div>

          <button
            type="submit"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
            className="w-full touch-manipulation rounded-lg bg-blue-600 px-6 py-4 font-bold text-white shadow-lg transition-transform active:scale-95"
            style={{
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              appearance: "none",
              WebkitAppearance: "none",
            }}
          >
            OK (Submit)
          </button>
        </form>

        <div className="mt-8 h-64 overflow-y-auto rounded-lg bg-gray-900 p-4 font-mono text-xs text-green-400">
          <div className="mb-2 flex items-center justify-between border-b border-gray-700 pb-2">
            <span className="font-bold text-white">Event Log</span>
            <button
              onClick={() => setLogs([])}
              className="rounded bg-gray-700 px-2 py-1 text-xs text-white"
            >
              Clear
            </button>
          </div>
          {logs.length === 0 && (
            <span className="text-gray-500 italic">No events yet...</span>
          )}
          {logs.map((log, i) => (
            <div key={i} className="mb-1">
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 max-w-md space-y-2 text-sm text-gray-600">
        <p>
          <strong>Testing Instructions:</strong>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Open this page on your mobile device.</li>
          <li>Tap the "OK" button.</li>
          <li>
            You should see "Touch Start", "Touch End", "Click", and "Submit" in
            the log.
          </li>
          <li>If "Submit" is missing, browser might be blocking it.</li>
        </ul>
      </div>
    </div>
  );
}
