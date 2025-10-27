import React, { useState } from "react";

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
      alert(
        `Report #${reportId} verified!\n\nType: ${report.type}\nLocation: ${report.location}\n\nEmergency teams have been deployed.`
      );
    } else {
      alert(
        `Report #${reportId} has been rejected and removed from the queue.`
      );
    }

    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "text-red-600 bg-red-50",
      High: "text-orange-600 bg-orange-50",
      Moderate: "text-yellow-600 bg-yellow-50",
      Low: "text-green-600 bg-green-50",
    };
    return colors[severity] || "text-gray-600 bg-gray-50";
  };

  if (reports.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          All Reports Processed
        </h3>
        <p className="text-gray-500">
          No pending reports at the moment. Great work!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-800">
                  {report.type}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(
                    report.severity
                  )}`}
                >
                  {report.severity}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{report.time}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-32">
                Location:
              </span>
              <span className="text-gray-600">{report.location}</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-32">
                Description:
              </span>
              <span className="text-gray-600">{report.description}</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-32">
                Reporter:
              </span>
              <span className="text-gray-600">{report.reporter}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleAction(report.id, "verify")}
              className="flex-1 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
            >
              ✓ Verify & Deploy
            </button>
            <button
              onClick={() => handleAction(report.id, "reject")}
              className="flex-1 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
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
