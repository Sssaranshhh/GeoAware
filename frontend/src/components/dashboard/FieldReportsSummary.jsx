import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api";

const FieldReportsSummary = ({ darkMode }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [recentlyUpdated, setRecentlyUpdated] = useState(new Set());

  const fetchReports = async () => {
    try {
      const response = await api.get("/field-reports");
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching field reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Clear recently updated when user manually changes filter
    // This allows the "disappearing" logic to resume once the admin is done with their batch
    setRecentlyUpdated(new Set());
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await api.put(`/field-reports/${id}/status`, { status });
      if (response.data.success) {
        setReports((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status } : r))
        );
        // Track this ID as recently updated so it stays visible in the current list
        setRecentlyUpdated((prev) => new Set([...prev, id]));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Logic fix: Item stays if it matches filter OR if it was just updated in this session
      if (filter === "all") return true;
      if (recentlyUpdated.has(report._id)) return true;
      return report.status === filter;
    });
  }, [reports, filter, recentlyUpdated]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: "hsl(35, 100%, 50%)",
          bg: "rgba(255, 165, 0, 0.1)",
          border: "rgba(255, 165, 0, 0.2)",
          icon: "🕒"
        };
      case "acknowledged":
        return {
          label: "Acknowledged",
          color: "hsl(210, 100%, 60%)",
          bg: "rgba(37, 99, 235, 0.1)",
          border: "rgba(37, 99, 235, 0.2)",
          icon: "🔵"
        };
      case "fulfilled":
        return {
          label: "Fulfilled",
          color: "hsl(142, 70%, 45%)",
          bg: "rgba(34, 197, 94, 0.1)",
          border: "rgba(34, 197, 94, 0.2)",
          icon: "✅"
        };
      default:
        return {
          label: status,
          color: "gray",
          bg: "rgba(128, 128, 128, 0.1)",
          border: "rgba(128, 128, 128, 0.2)",
          icon: "➖"
        };
    }
  };

  const getDisasterEmoji = (type) => {
    const map = {
      landslide: "⛰️",
      flood: "🌊",
      earthquake: "🫨",
      fire: "🔥",
      storm: "🌪️",
      other: "⚠️"
    };
    return map[type] || "🚨";
  };

  if (loading) {
    return (
      <div className="p-12 text-center animate-pulse">
        <div className="text-4xl mb-4">📄</div>
        <div className="text-lg font-medium opacity-50">Syncing field reports...</div>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl border shadow-xl overflow-hidden transition-all duration-500"
      style={{
        backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
        borderColor: darkMode ? "#2a2a2a" : "#f1f5f9",
      }}
    >
      {/* Header */}
      <div 
        className="p-8 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-opacity-50 backdrop-blur-md"
        style={{ borderColor: darkMode ? "#2a2a2a" : "#f1f5f9" }}
      >
        <div>
          <h3 className="text-2xl font-bold tracking-tight" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
            Field Intelligence <span className="opacity-50">Summary</span>
          </h3>
          <p className="text-sm mt-1" style={{ color: darkMode ? "#8a8a8a" : "#64748b" }}>
             Real-time operational updates from responders
          </p>
        </div>
        
        <div className="relative group">
          <select
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-semibold border outline-none transition-all cursor-pointer hover:shadow-md active:scale-95"
            style={{
              backgroundColor: darkMode ? "#2a2a2a" : "#f8fafc",
              borderColor: darkMode ? "#3a3a3a" : "#e2e8f0",
              color: darkMode ? "#ededed" : "#334155",
            }}
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="all">View All Status</option>
            <option value="pending">Only Pending</option>
            <option value="acknowledged">Acknowledged Only</option>
            <option value="fulfilled">Fulfilled Only</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            ▼
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="p-6 space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar bg-opacity-10">
        {filteredReports.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="text-6xl mb-4 opacity-20">📡</div>
            <p className="text-lg font-medium" style={{ color: darkMode ? "#6b7280" : "#94a3b8" }}>
              No active reports match this filter
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const config = getStatusConfig(report.status);
            const isRecentlyUpdated = recentlyUpdated.has(report._id);

            return (
              <div
                key={report._id}
                className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isRecentlyUpdated ? "ring-2 ring-blue-500 ring-opacity-20 translate-x-1" : ""
                }`}
                style={{
                  backgroundColor: darkMode ? "#262626" : "#ffffff",
                  borderColor: isRecentlyUpdated 
                    ? "rgba(59, 130, 246, 0.5)" 
                    : (darkMode ? "#2a2a2a" : "#f1f5f9"),
                }}
              >
                {/* Status Bar Indicator */}
                <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-500" 
                    style={{ backgroundColor: config.color }}
                />

                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* Left Side: Basic Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div 
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm flex items-center gap-1.5 transition-all group-hover:scale-105"
                        style={{ 
                          color: config.color, 
                          backgroundColor: config.bg, 
                          borderColor: config.border 
                        }}
                      >
                        <span className="text-[14px] leading-none mb-0.5">{config.icon}</span>
                        {config.label}
                      </div>

                      <div 
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-opacity-50 backdrop-blur-sm"
                        style={{ 
                          color: darkMode ? "#cbd5e1" : "#1e293b",
                          backgroundColor: darkMode ? "#334155" : "#f1f5f9",
                          borderColor: darkMode ? "#475569" : "#e2e8f0"
                        }}
                      >
                        {getDisasterEmoji(report.disasterType)} {report.disasterType}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm font-bold tracking-tight" style={{ color: darkMode ? "#f8fafc" : "#334155" }}>
                        📍 {report.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                        <div className="flex items-center gap-1.5 font-semibold">
                           <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white">
                                {report.responderName.charAt(0)}
                           </div>
                           {report.responderName}
                        </div>
                        <span className="opacity-30">•</span>
                        <div className="bg-slate-800 bg-opacity-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {report.responderDesignation}
                        </div>
                        <span className="opacity-30">•</span>
                        <span>{new Date(report.createdAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                    </div>

                    {report.notes && (
                        <div 
                            className="mt-4 p-4 rounded-xl border-l-4 text-sm leading-relaxed"
                            style={{ 
                                backgroundColor: darkMode ? "rgba(0,0,0,0.1)" : "#f8fafc",
                                borderColor: config.color,
                                color: darkMode ? "#b3b3b3" : "#475569"
                            }}
                        >
                            <span className="text-xl opacity-20 block mb-1">“</span>
                            {report.notes}
                        </div>
                    )}
                  </div>

                  {/* Right Side: Stats & Actions */}
                  <div className="lg:w-80 space-y-4">
                    <div 
                        className="p-4 rounded-2xl grid grid-cols-2 gap-4 border"
                        style={{ 
                            backgroundColor: darkMode ? "rgba(0,0,0,0.2)" : "#fbfcfd",
                            borderColor: darkMode ? "#2a2a2a" : "#f1f5f9"
                        }}
                    >
                        <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase opacity-40 leading-none">Helped</div>
                            <div className="text-2xl font-black text-blue-500 tabular-nums">{report.peopleHelped}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase opacity-40 leading-none">Injured</div>
                            <div className="text-2xl font-black text-rose-500 tabular-nums">{report.injuredCount}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 px-1">Resource Priority</div>
                        <div className="flex flex-wrap gap-1.5">
                            {report.resourcesNeeded.length > 0 ? (
                                report.resourcesNeeded.map((res) => (
                                    <span 
                                        key={res} 
                                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm transition-all hover:scale-105"
                                        style={{
                                            backgroundColor: darkMode ? "#334155" : "#e2e8f0",
                                            color: darkMode ? "#f8fafc" : "#1e293b"
                                        }}
                                    >
                                        📦 {res}
                                    </span>
                                ))
                            ) : (
                              <span className="text-xs italic opacity-30">No critical resources requested</span>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      {report.status !== "fulfilled" && (
                        <button
                          onClick={() => updateStatus(report._id, report.status === "pending" ? "acknowledged" : "fulfilled")}
                          className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 group/btn"
                          style={{
                            background: report.status === "pending" 
                              ? "linear-gradient(135deg, #3b82f6, #2563eb)" 
                              : "linear-gradient(135deg, #10b981, #059669)",
                            color: "#ffffff"
                          }}
                        >
                          <span className="group-hover/btn:translate-x-1 inline-block transition-transform">
                             {report.status === "pending" ? "→ Initiate Response" : "✓ Mark as Resolved"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FieldReportsSummary;
