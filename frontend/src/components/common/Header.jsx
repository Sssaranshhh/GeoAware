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
    <header className="flex justify-between items-center bg-white p-4 shadow-md">
      <div className="text-xl font-bold text-blue-600">GeoAware 🌍</div>
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-semibold">{userName}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
