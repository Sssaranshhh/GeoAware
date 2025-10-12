// src/components/Sidebar.jsx
import React from "react";

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "map", label: "Risk Map", keyLabel: "map" },
  { key: "alert", label: "Report Alert", roles: ["user"] },
  { key: "verify", label: "Verify Reports", roles: ["responder"] },
  { key: "broadcast", label: "Broadcast Alert", roles: ["admin"] },
];

export default function Sidebar({ activeTab, setActiveTab, role }) {
  return (
    <aside className="w-64 bg-white shadow-md flex flex-col p-4">
      <h2 className="text-lg font-bold mb-6 text-blue-600">Menu</h2>
      <nav className="flex flex-col gap-2">
        {menuItems.map(
          (item) =>
            (!item.roles || item.roles.includes(role)) && (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`text-left p-3 rounded-lg w-full hover:bg-blue-100 transition ${
                  activeTab === item.key ? "bg-blue-500 text-white" : "text-gray-700"
                }`}
              >
                {item.label}
              </button>
            )
        )}
      </nav>
    </aside>
  );
}
