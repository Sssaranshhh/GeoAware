import React from "react";

const StatsCard = ({ label, value, icon, darkMode }) => {
  return (
    <div
      className="p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105 border"
      style={{
        backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
        borderColor: darkMode ? "#3a3a3a" : "#e2e8f0",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="text-sm font-medium"
          style={{ color: darkMode ? "#b3b3b3" : "#475569" }}
        >
          {label}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-indigo-400">{value}</div>
    </div>
  );
};

export default StatsCard;