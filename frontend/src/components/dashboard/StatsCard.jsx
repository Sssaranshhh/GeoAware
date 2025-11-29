import React from "react";

const StatsCard = ({ label, value, icon }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-slate-600">{label}</div>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-indigo-600">{value}</div>
    </div>
  );
};

export default StatsCard;
