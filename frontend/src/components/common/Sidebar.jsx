import React from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";

const Sidebar = ({ darkMode }) => {
  const { role } = useAppContext();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "📊",
      roles: ["user", "responder", "admin"],
    },
    {
      path: "/map",
      label: "Risk Map",
      icon: "🗺️",
      roles: ["user", "responder", "admin"],
    },
    {
      path: "/safety",
      label: "Safety Tips",
      icon: "🛡️",
      roles: ["user", "responder", "admin"],
    },

    { path: "/alert", label: "Report Alert", icon: "🚨", roles: ["user"] },
    {
      path: "/verify",
      label: "Verify Reports",
      icon: "✅",
      roles: ["responder"],
    },
    {
      path: "/broadcast",
      label: "Broadcast Alert",
      icon: "📢",
      roles: ["admin"],
    },
    {
      path: "/inbox",
      label: "Inbox",
      icon: "📬",
      roles: ["user", "responder", "admin"],
    },
    {
      path: "/predict",
      label: "Disaster Prediction",
      icon: "🗓️",
      roles: ["user", "responder", "admin"],
    },
    {
      path: "/air-quality",
      label: "Air Quality",
      icon: "😷",
      roles: ["user", "responder", "admin"],
    },
    {
      path: "/flood-routing",
      label: "Flood Route",
      icon: "⛵",
      roles: ["user", "responder", "admin"],
    },
    {
      path: "/flood-prediction",
      label: "Flood Prediction",
      icon: "🌊",
      roles: ["user", "responder", "admin"],
    },
    {
      path: "/mosdac-prediction",
      label: "Satellite Flood Risk",
      icon: "🛰️",
      roles: ["user", "responder", "admin"],
    }
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className="w-64 border-r p-6 flex flex-col gap-6 rounded-xl shadow-sm"
      style={{
        backgroundColor: darkMode ? "#202020" : "#ffffff",
        borderColor: darkMode ? "#2f2f2f" : "#e2e8f0",
      }}
    >
      <h2
        className="text-xl font-bold"
        style={{ color: darkMode ? "#ededed" : "#000000" }}
      >
        Menu
      </h2>

      <nav className="flex flex-col gap-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
              ${isActive
                ? darkMode
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105"
                  : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105"
                : darkMode
                  ? "text-gray-300 hover:bg-gray-800 active:scale-95"
                  : "text-slate-700 hover:bg-slate-100 active:scale-95"
              }
              `
            }
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;