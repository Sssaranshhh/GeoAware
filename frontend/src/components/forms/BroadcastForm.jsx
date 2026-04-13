import React, { useState } from "react";

const BroadcastForm = ({ ws, darkMode }) => {
  const [message, setMessage] = useState("");
  const [disasterType, setDisasterType] = useState("");
  const [location, setLocation] = useState("");
  const userId = localStorage.getItem("userId");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message === "") {
      alert("Type some message");
      return;
    }
    const data = { message, disasterType, location };
    ws.send(JSON.stringify({
      userId,
      type: "Message",
      userType: "Admin",
      content: data,
      receiverType: "User",
      read: false,
    }));
    alert("Broadcasted Successfully ✅");
  };

  const cardBg = darkMode ? "#242424" : "#ffffff";
  const cardBorder = darkMode ? "#3a3a3a" : "#e2e8f0";
  const labelColor = darkMode ? "#b3b3b3" : "#374151";
  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${darkMode ? "#3a3a3a" : "#d1d5db"}`,
    backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
    color: darkMode ? "#ededed" : "#111827",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl shadow-md max-w-3xl mx-auto"
      style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
    >
      <div className="space-y-5">
        {/* Alert Type */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Alert Type
          </label>
          <select
            required
            style={inputStyle}
            onChange={(e) => setDisasterType(e.target.value)}
          >
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

        {/* Affected Region */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Affected Region
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Shimla District, Sector 1-5"
            style={inputStyle}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Alert Message */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Alert Message
          </label>
          <textarea
            required
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide detailed information about the emergency and recommended actions..."
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white rounded-lg font-semibold hover:scale-105 transition transform"
        >
          📢 Send Broadcast Alert
        </button>
      </div>
    </form>
  );
};

export default BroadcastForm;
