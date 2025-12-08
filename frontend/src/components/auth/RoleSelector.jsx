import React from "react";
import { useAppContext } from "../../Context/AppContext";

const RoleSelector = () => {
  const { role, setRole } = useAppContext();

  const roles = [
    { key: "user", label: "User", icon: "👤", color: "indigo" },
    { key: "responder", label: "Responder", icon: "🚨", color: "emerald" },
    { key: "admin", label: "Admin", icon: "⚡", color: "amber" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {roles.map((r) => (
        <button
          key={r.key}
          type="button"
          onClick={() => setRole(r.key)}
          className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
            role === r.key
              ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100 scale-105"
              : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md hover:scale-105"
          }`}
        >
          <span className="text-3xl">{r.icon}</span>
          <span
            className={`text-xs font-semibold ${
              role === r.key ? "text-indigo-700" : "text-slate-600"
            }`}
          >
            {r.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default RoleSelector;
