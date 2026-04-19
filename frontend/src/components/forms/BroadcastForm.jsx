import React, { useState } from "react";

const BroadcastForm = ({ ws, message: incomingMessage, darkMode }) => {
  const [broadcastNote, setBroadcastNote] = useState("");
  const userId = localStorage.getItem("userId");

  const messageContent = incomingMessage?.content
    ? typeof incomingMessage.content === "object"
      ? incomingMessage.content
      : { message: incomingMessage.content }
    : {};

  const hasMessage = Object.keys(messageContent).length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("❌ Connection lost. Please wait a moment or refresh the page.");
      return;
    }

    if (!hasMessage) {
      alert("Select an alert from inbox to broadcast");
      return;
    }

    const contentToSend = {
      ...messageContent,
      adminBroadcastNote: broadcastNote,
    };

    ws.send(JSON.stringify({
      userId,
      type: "Message",
      userType: "Admin",
      content: contentToSend,
      receiverType: "User",
      read: false,
    }));
    alert("Broadcasted Successfully ✅");
    setBroadcastNote("");
  };

  const renderDetailItem = (label, value) => {
    if (!value) return null;
    return (
      <div className="text-sm mb-1">
        <span className="font-semibold" style={{ color: darkMode ? "#e2e8f0" : "#1f2937" }}>
          {label}:
        </span>{" "}
        <span style={{ color: darkMode ? "#cbd5e1" : "#4b5563" }}>{value}</span>
      </div>
    );
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
        <div>
          <h3 className="text-lg font-semibold" style={{ color: darkMode ? "#f8fafc" : "#111827" }}>
            Verified Alert to Broadcast
          </h3>
          {!hasMessage ? (
            <p className="text-sm mt-2" style={{ color: darkMode ? "#94a3b8" : "#475569" }}>
              Select an official-verified alert from the inbox to broadcast full details to users.
            </p>
          ) : (
            <div className="mt-3">
              {renderDetailItem("Disaster", messageContent.disasterType)}
              {renderDetailItem("Severity", messageContent.severity)}
              {renderDetailItem("Location", messageContent.location)}
              {renderDetailItem("Contact", messageContent.contact)}
              {renderDetailItem("Message", messageContent.message)}
              {renderDetailItem("Photo", messageContent.photoUrl ? "Attached" : "None")}
              {messageContent.officialNote && renderDetailItem("Official Notes", messageContent.officialNote)}
            </div>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Additional Broadcast Notes (Optional)
          </label>
          <textarea
            rows="4"
            value={broadcastNote}
            onChange={(e) => setBroadcastNote(e.target.value)}
            placeholder={hasMessage ? "Add any additional context or instructions for users..." : "Waiting for a report to arrive..."}
            style={{ ...inputStyle, resize: "vertical" }}
            disabled={!hasMessage}
          />
        </div>

        <button
          type="submit"
          disabled={!hasMessage}
          className="w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white rounded-lg font-semibold hover:scale-105 transition transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📢 Send Broadcast Alert
        </button>
      </div>
    </form>
  );
};

export default BroadcastForm;
