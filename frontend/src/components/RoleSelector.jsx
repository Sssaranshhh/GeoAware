// src/components/RoleSelector.jsx
import React from "react";

export default function RoleSelector({ role, setRole }) {
  const roles = [
    { key: "user", label: "User", icon: "👤" },
    { key: "responder", label: "Responder", icon: "🚨" },
    { key: "admin", label: "Admin", icon: "⚡" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {roles.map((r) => (
        <button
          key={r.key}
          className={`p-3 border rounded-lg flex flex-col items-center transition transform ${
            role === r.key
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white border-gray-300"
          } hover:-translate-y-1 hover:shadow-md`}
          onClick={() => setRole(r.key)}
        >
          <span className="text-2xl mb-1">{r.icon}</span>
          <span className="text-xs font-semibold">{r.label}</span>
        </button>
      ))}
    </div>
  );
}
