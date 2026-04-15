import React, { useState } from "react";

const VerifyReports = ({ ws, darkMode }) => {
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId");

  const handleAction = (action) => {
    if (message === "") {
      alert("Type some message");
      return;
    }

    // Check if WebSocket is connected
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("❌ Connection lost. Please wait a moment or refresh the page.");
      return;
    }

    ws.send(JSON.stringify({
      userId,
      type: "Message",
      userType: "Official",
      isAuthenticated: action === "accept",
      content: message,
      receiverType: "Admin",
      read: false,
    }));
    alert("Sent to admins ✅");
  };

  const cardBg = darkMode ? "#242424" : "#ffffff";
  const cardBorder = darkMode ? "#3a3a3a" : "#e2e8f0";
  const labelColor = darkMode ? "#b3b3b3" : "#374151";
  const inputStyle = {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "8px",
    border: `2px solid ${darkMode ? "#3a3a3a" : "#e2e8f0"}`,
    backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
    color: darkMode ? "#ededed" : "#111827",
    outline: "none",
    transition: "border-color 0.2s",
    minWidth: 0,
  };

  return (
    <div className="grid gap-4">
      <div
        className="p-6 rounded-xl shadow-md hover:shadow-lg transition"
        style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold shrink-0" style={{ color: labelColor }}>
              Description:
            </span>
            <input
              type="text"
              style={inputStyle}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide detailed information about the emergency and recommended actions..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleAction("accept")}
            className="flex-1 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
          >
            ✓ Verify &amp; Deploy
          </button>
          <button
            onClick={() => handleAction("reject")}
            className="flex-1 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            ✗ Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyReports;
