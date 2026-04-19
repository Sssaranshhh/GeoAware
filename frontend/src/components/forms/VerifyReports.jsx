import React, { useState } from "react";

const VerifyReports = ({ ws, message, darkMode }) => {
  const [actionNote, setActionNote] = useState("");
  const userId = localStorage.getItem("userId");

  const reportContent = message?.content
    ? typeof message.content === "object"
      ? message.content
      : { message: message.content }
    : {};

  const handleAction = (action) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("❌ Connection lost. Please wait a moment or refresh the page.");
      return;
    }

    if (!message) {
      alert("Waiting for an incoming alert to verify.");
      return;
    }

    const contentToSend = {
      ...reportContent,
      officialNote: actionNote,
      verified: action === "accept",
    };

    ws.send(JSON.stringify({
      userId,
      type: "Message",
      userType: "Official",
      isAuthenticated: action === "accept",
      content: contentToSend,
      receiverType: "Admin",
      read: false,
    }));

    alert("Sent full report to admins ✅");
    setActionNote("");
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

  const hasReport = Object.keys(reportContent).length > 0;

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

  return (
    <div className="grid gap-4">
      <div
        className="p-6 rounded-xl shadow-md hover:shadow-lg transition"
        style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="space-y-5 mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: darkMode ? "#f8fafc" : "#111827" }}>
              Incoming Alert Details
            </h3>
            {!hasReport ? (
              <p className="text-sm mt-2" style={{ color: darkMode ? "#94a3b8" : "#475569" }}>
                Waiting for a community alert to verify. Open the inbox and select a report to send full details to admins.
              </p>
            ) : (
              <div className="mt-3">
                {renderDetailItem("Disaster", reportContent.disasterType)}
                {renderDetailItem("Severity", reportContent.severity)}
                {renderDetailItem("Location", reportContent.location)}
                {renderDetailItem("Contact", reportContent.contact)}
                {renderDetailItem("Message", reportContent.message)}
                {renderDetailItem("Photo", reportContent.photoUrl ? "Attached" : "None")}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold" style={{ color: labelColor }}>
              Verification notes
            </label>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              rows={4}
              placeholder={hasReport ? "Add any extra context or confirmation notes for admins..." : "Waiting for a report to arrive..."}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: `2px solid ${darkMode ? "#3a3a3a" : "#e2e8f0"}`,
                backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                color: darkMode ? "#e2e8f0" : "#111827",
                resize: "vertical",
              }}
              disabled={!hasReport}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleAction("accept")}
            disabled={!hasReport}
            className="flex-1 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ Send Full Report
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={!hasReport}
            className="flex-1 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✗ Reject Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyReports;
