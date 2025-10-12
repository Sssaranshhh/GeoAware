// src/components/AlertForm.jsx
import React from "react";

import { useState } from "react";

export default function AlertForm() {
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Alert submitted!\nSeverity: ${severity || "Not selected"}\nMessage: ${message}`);
    setMessage("");
    setSeverity("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Report Emergency Alert</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Disaster Type</label>
        <select className="w-full p-3 border rounded-lg" required>
          <option value="">Select disaster type...</option>
          <option value="landslide">Landslide</option>
          <option value="flood">Flood</option>
          <option value="earthquake">Earthquake</option>
          <option value="fire">Wildfire</option>
          <option value="storm">Severe Storm</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Severity Level</label>
        <div className="grid grid-cols-4 gap-2">
          {["Low", "Moderate", "High", "Critical"].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setSeverity(s)}
              className={`p-3 rounded-lg font-semibold border ${
                severity === s ? "text-white" : "text-gray-700"
              } ${
                s === "Low"
                  ? severity === s
                    ? "bg-green-500"
                    : "bg-white"
                  : s === "Moderate"
                  ? severity === s
                    ? "bg-yellow-400"
                    : "bg-white"
                  : s === "High"
                  ? severity === s
                    ? "bg-orange-500"
                    : "bg-white"
                  : severity === s
                  ? "bg-red-500"
                  : "bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Location</label>
        <input className="w-full p-3 border rounded-lg" placeholder="Address or landmark (auto-detected: Current Location)" required />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Description</label>
        <textarea
          className="w-full p-3 border rounded-lg"
          placeholder="Describe what you're witnessing in detail..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Contact Number (Optional)</label>
        <input className="w-full p-3 border rounded-lg" placeholder="+91 XXXXX XXXXX" />
      </div>

      <button type="submit" className="w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white rounded-lg font-semibold">
        🚨 Submit Alert
      </button>
    </form>
  );
}
