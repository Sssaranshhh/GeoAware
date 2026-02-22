import React from "react";
import BroadcastForm from "../components/forms/BroadcastForm";

const BroadcastPage = ({ ws, darkMode }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: darkMode ? "#ededed" : "#1e293b" }}
        >
          Broadcast Emergency Alert 📢
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: darkMode ? "#8a8a8a" : "#64748b" }}
        >
          Send warnings to all users in the affected region.
        </p>
      </div>

      <BroadcastForm ws={ws} darkMode={darkMode} />
    </div>
  );
};

export default BroadcastPage;