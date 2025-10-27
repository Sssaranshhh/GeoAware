import React from "react";
import { useAppContext } from "../Context/AppContext";
import StatsCard from "../components/dashboard/StatsCard";

const DashboardPage = () => {
  const { role, userName } = useAppContext();

  const stats = [
    { label: "Total Alerts Submitted", value: 47, icon: "📄" },
    { label: "Verified Reports", value: 42, icon: "✅" },
    { label: "Active Alerts in Area", value: 3, icon: "🚨" },
    { label: "Community Rank", value: "#128", icon: "🏆" },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-600 mt-1">
          {role === "user" && "Stay informed about disasters in your area"}
          {role === "responder" && "Review and verify emergency reports"}
          {role === "admin" && "Manage and broadcast emergency alerts"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}

        {/* Weather Card */}
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
      </div>
    </div>
  );
};

export default DashboardPage;
