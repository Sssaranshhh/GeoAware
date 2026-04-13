import React from "react";
import { useAppContext } from "../../Context/AppContext";

const RoleSelector = ({ darkMode }) => {
  const { role, setRole } = useAppContext();

  const roles = [
    { key: "user", label: "User", icon: "👤" },
    { key: "responder", label: "Responder", icon: "🚨" },
    { key: "admin", label: "Admin", icon: "⚡" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {roles.map((r) => (
        <button
          key={r.key}
          type="button"
          onClick={() => setRole(r.key)}
          className="p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 hover:scale-105"
          style={
            role === r.key
              ? {
                borderColor: "#6366f1",
                backgroundColor: darkMode ? "#1e1e3a" : "#eef2ff",
                boxShadow: "0 4px 14px rgba(99,102,241,0.2)",
                transform: "scale(1.05)",
              }
              : {
                borderColor: darkMode ? "#3a3a3a" : "#e2e8f0",
                backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
              }
          }
        >
          <span className="text-3xl">{r.icon}</span>
          <span
            className="text-xs font-semibold"
            style={{ color: role === r.key ? "#818cf8" : darkMode ? "#9ca3af" : "#475569" }}
          >
            {r.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default RoleSelector;
