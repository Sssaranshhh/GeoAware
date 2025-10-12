// src/components/VerifyReports.jsx
import React from "react";

import { useState } from "react";

const initial = [
  { id: 1, type: "Wildfire - Critical", when: "15 minutes ago", location: "Shimla Hills, Sector 7", desc: "Large fire spreading rapidly.", reporter: "Raj Kumar" },
  { id: 2, type: "Flood - High", when: "45 minutes ago", location: "River Road, Near Bridge", desc: "River water overflowing.", reporter: "Priya Singh" },
  { id: 3, type: "Landslide - Moderate", when: "2 hours ago", location: "Hill View Road, KM 15", desc: "Small rocks and debris falling.", reporter: "Amit Sharma" },
];

export default function VerifyReports() {
  const [reports, setReports] = useState(initial);

  function handleAction(id, action) {
    if (action === "verify") {
      alert(`Report #${id} verified! Emergency teams deployed.`);
      setReports((r) => r.filter((x) => x.id !== id));
    } else {
      alert(`Report #${id} rejected and removed from queue.`);
      setReports((r) => r.filter((x) => x.id !== id));
    }
  }

  return (
    <div className="grid gap-4">
      {reports.map((r) => (
        <div key={r.id} className="bg-white p-5 rounded-xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-lg">{r.type}</div>
              <div className="text-sm text-gray-500">{r.when}</div>
            </div>
          </div>

          <p className="mt-3"><strong>Location:</strong> {r.location}</p>
          <p><strong>Description:</strong> {r.desc}</p>
          <p><strong>Reporter:</strong> {r.reporter}</p>

          <div className="mt-4 flex gap-3">
            <button onClick={() => handleAction(r.id, "verify")} className="flex-1 py-2 rounded-md bg-green-500 text-white font-semibold">✓ Verify & Deploy</button>
            <button onClick={() => handleAction(r.id, "reject")} className="flex-1 py-2 rounded-md bg-red-500 text-white font-semibold">✗ Reject</button>
          </div>
        </div>
      ))}
      {reports.length === 0 && <div className="text-center text-gray-500">No pending reports</div>}
    </div>
  );
}
