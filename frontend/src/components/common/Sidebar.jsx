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
    <aside className="w-64 bg-white shadow-md flex flex-col p-4">
      <h2 className="text-lg font-bold mb-6 text-blue-600">Menu</h2>
      <nav className="flex flex-col gap-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-blue-100"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
