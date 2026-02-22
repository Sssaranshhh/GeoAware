import React, { useEffect } from "react";
import { useAppContext } from "../Context/AppContext";
import StatsCard from "../components/dashboard/StatsCard";
import {Bell} from "lucide-react"
import { Link, useNavigate } from "react-router-dom";

const DashboardPage = ({ message }) => {
  const { role, userName } = useAppContext();
  const navigate = useNavigate();

  const stats = [
    { label: "Total Alerts Submitted", value: 47, icon: "📄" },
    { label: "Verified Reports", value: 42, icon: "✅" },
    { label: "Active Alerts in Area", value: 3, icon: "🚨" },
    { label: "Community Rank", value: "#128", icon: "🏆" },
  ];

  const handleInbox = ()=>{
    navigate(`/inbox`)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome back, {userName}! 👋
        </h1>
        <button onClick={handleInbox}><Bell /></button>

        </div>
        <p className="text-slate-600 mt-1">
          {role === "user" && "Stay informed about disasters in your area"}
          {role === "responder" && "Review and verify emergency reports"}
          {role === "admin" && "Manage and broadcast emergency alerts"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Weather Card (Improved Compact Version) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center gap-6 flex-wrap">
          {/* Title */}
          <div>
            <div className="text-base font-semibold text-slate-700">
              Current Weather
            </div>
            <div className="text-xs text-slate-500 mt-1">Updated just now</div>
          </div>

          {/* Weather Data */}
          <div className="flex items-center gap-4">
            <div className="text-5xl">🌤️</div>
            <div className="text-right">
              <div className="text-4xl font-extrabold text-indigo-600 leading-none">
                28°C
              </div>
              <div className="text-sm text-slate-600 font-medium">
                Partly Cloudy
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Humidity: 65% • Wind: 12 km/h
              </div>
              <div className="text-xs text-slate-500">Pressure: 1013 hPa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;