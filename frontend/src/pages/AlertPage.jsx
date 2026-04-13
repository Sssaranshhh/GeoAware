import React from "react";
import AlertForm from "../components/forms/AlertForm";

const AlertPage = ({ ws, darkMode }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: darkMode ? "#ededed" : "#1e293b" }}
        >
          Report a Disaster 🚨
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: darkMode ? "#8a8a8a" : "#64748b" }}
        >
          Provide details about the incident to help responders act quickly.
        </p>
      </div>

      <AlertForm ws={ws} darkMode={darkMode} />
    </div>
  );
};

export default AlertPage;
