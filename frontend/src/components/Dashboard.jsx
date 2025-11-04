// src/components/Dashboard.jsx
import React, { useState } from "react";
import MLplugin from "./ML-plugin";

export default function Dashboard({ role }) {

  const [open, setOpen] = useState(false);
  
  const stats = [
    { label: "Total Alerts Submitted", value: 47, icon: "📄" },
    { label: "Verified Reports", value: 42, icon: "✅" },
    { label: "Active Alerts in Area", value: 3, icon: "🚨" },
    { label: "Community Rank", value: "#128", icon: "🏆" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-3 hover:scale-105 transform transition"
        >
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-700">{s.label}</div>
            <div className="text-3xl">{s.icon}</div>
          </div>
          <div className="text-3xl font-bold text-blue-600">{s.value}</div>
        </div>
      ))}

      {/* Weather card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
        <div className="text-lg font-semibold mb-2">Current Weather</div>
        <div className="flex items-center gap-6">
          <div className="text-5xl font-bold">28°C</div>
          <div>
            <div className="font-semibold">Partly Cloudy</div>
            <div className="text-sm opacity-90">
              Humidity: 65% • Wind: 12 km/h
            </div>
            <div className="text-sm opacity-90">Pressure: 1013 hPa</div>
          </div>
        </div>
      </div>

      <div
        className="bg-gradient-to-br from-blue-500 to-purple-700 p-6 rounded-2xl text-white shadow-lg cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="text-lg font-semibold mb-2">ML-plugin</div>
      </div>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <MLplugin />
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
