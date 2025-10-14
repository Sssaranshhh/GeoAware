import React from "react";

const StatsCard = ({ label, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-3 hover:scale-105 transform transition">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-gray-700">{label}</div>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-blue-600">{value}</div>
    </div>
  );
};

export default StatsCard;
