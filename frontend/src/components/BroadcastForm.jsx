// src/components/BroadcastForm.jsx
import React from "react";

import { useState } from "react";

export default function BroadcastForm() {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Broadcast sent!\nPriority: ${priority}\nMessage: ${message}`);
    setMessage("");
    setPriority("medium");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Broadcast Emergency Alert</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Alert Type</label>
        <select className="w-full p-3 border rounded-lg" required>
          <option value="">Select alert type...</option>
          <option value="landslide">Landslide Warning</option>
          <option value="flood">Flood Warning</option>
          <option value="earthquake">Earthquake Alert</option>
          <option value="fire">Fire Warning</option>
          <option value="storm">Storm Warning</option>
          <option value="evacuation">Evacuation Order</option>
          <option value="all-clear">All Clear</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Severity Level</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-3 border rounded-lg">
          <option value="low">Advisory</option>
          <option value="medium">Watch</option>
          <option value="high">Warning</option>
          <option value="critical">Emergency</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Affected Region</label>
        <input className="w-full p-3 border rounded-lg" placeholder="e.g., Shimla District, Sector 1-5" required />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Alert Message</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Provide detailed information..." required />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Recommended Actions</label>
        <textarea className="w-full p-3 border rounded-lg" placeholder="List safety measures and evacuation instructions if applicable..." required />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Alert Duration (hours)</label>
        <input type="number" className="w-full p-3 border rounded-lg" placeholder="24" min="1" required />
      </div>

      <button type="submit" className="w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white rounded-lg font-semibold">📢 Send Broadcast Alert</button>
    </form>
  );
}
