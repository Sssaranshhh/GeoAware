import React from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";

const Sidebar = () => {
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
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">Menu</h2>

      <nav className="flex flex-col gap-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
              ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105"
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
