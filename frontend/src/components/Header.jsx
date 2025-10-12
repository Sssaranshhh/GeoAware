// src/components/Header.jsx
import React from "react";

export default function Header({ userName, setIsLoggedIn }) {
  return (
    <header className="flex justify-between items-center bg-white p-4 shadow-md">
      <div className="text-xl font-bold text-blue-600">GeoAware 🌍</div>
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-semibold">{userName}</span>
        <button
          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          onClick={() => setIsLoggedIn(false)}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
