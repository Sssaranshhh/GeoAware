import React from "react";
import VerifyReports from "../components/forms/VerifyReports";

const VerifyPage = ({ ws, message, darkMode }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: darkMode ? "#ededed" : "#1e293b" }}
        >
          Verify Community Reports 🕵️‍♂️
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: darkMode ? "#8a8a8a" : "#64748b" }}
        >
          Review and validate incoming emergency alerts.
        </p>
      </div>

      <VerifyReports ws={ws} message={message} darkMode={darkMode} />
    </div>
  );
};

export default VerifyPage;
