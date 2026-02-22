import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";

const Header = ({ darkMode, setDarkMode }) => {
  const { userName, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header
      className={`border-b px-6 py-4 flex justify-between items-center shadow-sm rounded-xl ${
        darkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
      style={{
        backgroundColor: darkMode ? "#2d2d2d" : "#ffffff",
        borderColor: darkMode ? "#4a4a4a" : "#e2e8f0",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
          <span>🌍</span>
        </div>
        <span
          className={`text-xl font-bold ${
            darkMode ? "text-white" : "text-slate-800"
          }`}
        >
          GeoAware
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-3 py-2 rounded-lg font-semibold transition-all duration-200 ${
            darkMode
              ? "bg-slate-700 text-yellow-400 hover:bg-slate-600"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
          title={darkMode ? "Light Mode" : "Dark Mode"}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        <span
          className={`font-semibold ${
            darkMode ? "text-gray-300" : "text-slate-700"
          }`}
        >
          {userName}
        </span>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 
          hover:to-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;