import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";

const Header = () => {
  const { userName, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm rounded-xl">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
          <span>🌍</span>
        </div>
        <span className="text-xl font-bold text-slate-800">GeoAware</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-slate-700 font-semibold">{userName}</span>

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
