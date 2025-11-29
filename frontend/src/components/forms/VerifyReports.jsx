import React, { useState } from "react";
import { toast } from "react-toastify";

const VerifyReports = () => {
  const initialReports = [
    {
      id: 1,
      type: "Wildfire",
      severity: "Critical",
      time: "15 minutes ago",
      location: "Shimla Hills, Sector 7",
      description: "Large fire spreading rapidly through forest area.",
      reporter: "Raj Kumar",
    },
    {
      id: 2,
      type: "Flood",
      severity: "High",
      time: "45 minutes ago",
      location: "River Road, Near Bridge",
      description: "River water overflowing onto main road.",
      reporter: "Priya Singh",
    },
    {
      id: 3,
      type: "Landslide",
      severity: "Moderate",
      time: "2 hours ago",
      location: "Hill View Road, KM 15",
      description: "Small rocks and debris falling onto highway.",
      reporter: "Amit Sharma",
    },
  ];

  const [reports, setReports] = useState(initialReports);

  const handleAction = (reportId, action) => {
    const report = reports.find((r) => r.id === reportId);

    if (action === "verify") {
      toast.success(
        `Report #${reportId} verified! 🚨\nType: ${report.type}\nLocation: ${report.location}`
      );
    } else {
      toast.error(`Report #${reportId} rejected and removed from queue ❌`);
    }

    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "text-red-700 bg-red-50 border-red-200",
      High: "text-orange-700 bg-orange-50 border-orange-200",
      Moderate: "text-amber-700 bg-amber-50 border-amber-200",
      Low: "text-emerald-700 bg-emerald-50 border-emerald-200",
    };
    return colors[severity] || "text-slate-700 bg-slate-50 border-slate-200";
  };

  if (reports.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-10 rounded-2xl shadow-md text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          All Reports Processed
        </h3>
        <p className="text-slate-500">
          No pending reports at the moment. Great work!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-800">
                  {report.type}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityColor(
                    report.severity
                  )}`}
                >
                  {report.severity}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{report.time}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-start">
              <span className="font-semibold text-slate-700 w-32">
                Location:
              </span>
              <span className="text-slate-600">{report.location}</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-slate-700 w-32">
                Description:
              </span>
              <span className="text-slate-600">{report.description}</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-slate-700 w-32">
                Reporter:
              </span>
              <span className="text-slate-600">{report.reporter}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleAction(report.id, "verify")}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all"
            >
              ✓ Verify & Deploy
            </button>
            <button
              onClick={() => handleAction(report.id, "reject")}
              className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm hover:shadow-md transition-all"
            >
              ✗ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerifyReports;
