import React from "react";
import { useAppContext } from "../Context/AppContext";
import StatsCard from "../components/dashboard/StatsCard";
import FieldReportsSummary from "../components/dashboard/FieldReportsSummary";

const DashboardPage = ({ message, darkMode }) => {
  const { role, userName } = useAppContext();

  const stats = [
    { label: "Total Alerts Submitted", value: 47, icon: "📄" },
    { label: "Verified Reports", value: 42, icon: "✅" },
    { label: "Active Alerts in Area", value: 3, icon: "🚨" },
    { label: "Community Rank", value: "#128", icon: "🏆" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ color: darkMode ? "#ededed" : "#1e293b" }}
        >
          Welcome back, {userName}! 👋
        </h1>
        <p
          className="mt-1"
          style={{ color: darkMode ? "#8a8a8a" : "#64748b" }}
        >
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
            darkMode={darkMode}
          />
        ))}
      </div>

      {/* Weather Card */}
      <div
        className="rounded-2xl border shadow-sm p-6"
        style={{
          backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
          borderColor: darkMode ? "#3a3a3a" : "#e2e8f0",
        }}
      >
        <div className="flex justify-between items-center gap-6 flex-wrap">
          <div>
            <div
              className="text-base font-semibold"
              style={{ color: darkMode ? "#ededed" : "#334155" }}
            >
              Current Weather
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: darkMode ? "#8a8a8a" : "#94a3b8" }}
            >
              Updated just now
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-5xl">🌤️</div>
            <div className="text-right">
              <div className="text-4xl font-extrabold text-indigo-400 leading-none">
                28°C
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: darkMode ? "#b3b3b3" : "#475569" }}
              >
                Partly Cloudy
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: darkMode ? "#8a8a8a" : "#94a3b8" }}
              >
                Humidity: 65% • Wind: 12 km/h
              </div>
              <div
                className="text-xs"
                style={{ color: darkMode ? "#8a8a8a" : "#94a3b8" }}
              >
                Pressure: 1013 hPa
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Specific: Field Reports Summary */}
      {role === "admin" && (
        <div className="mt-8">
          <FieldReportsSummary darkMode={darkMode} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;