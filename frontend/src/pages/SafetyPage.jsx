import React, { useState } from "react";

const SafetyPage = ({ darkMode }) => {
  const [selectedDisaster, setSelectedDisaster] = useState("earthquake");

  const safetyData = {
    earthquake: {
      icon: "🌍",
      title: "Earthquake Safety",
      color: darkMode ? "text-indigo-400" : "text-indigo-600",
      before: [
        "Secure heavy furniture and appliances to walls",
        "Keep emergency supplies (water, food, first aid kit)",
        "Identify safe spots in each room (under sturdy tables)",
        "Practice Drop, Cover, and Hold On drills",
        "Store important documents in waterproof containers",
      ],
      during: [
        "DROP to your hands and knees",
        "COVER your head and neck under sturdy furniture",
        "HOLD ON until shaking stops",
        "Stay away from windows and outside walls",
        "If outdoors, move away from buildings and power lines",
      ],
      after: [
        "Check yourself and others for injuries",
        "Inspect home for damage and hazards",
        "Be prepared for aftershocks",
        "Listen to emergency broadcasts",
        "Use text messages instead of phone calls",
      ],
    },

    flood: {
      icon: "🌊",
      title: "Flood Safety",
      color: darkMode ? "text-blue-400" : "text-blue-600",
      before: [
        "Know your flood risk and evacuation routes",
        "Keep emergency supplies on higher floors",
        "Install check valves in plumbing",
        "Move valuable items to upper floors",
        "Purchase flood insurance",
      ],
      during: [
        "Evacuate immediately if told to do so",
        "Move to higher ground",
        "Never walk, swim, or drive through flood waters",
        "Avoid contact with floodwater (may be contaminated)",
        "Turn off utilities if instructed",
      ],
      after: [
        "Return home only when authorities say it is safe",
        "Avoid floodwater and standing water",
        "Document damage with photos",
        "Clean and disinfect everything touched by floodwater",
        "Watch for damaged electrical wiring",
      ],
    },

    landslide: {
      icon: "⛰️",
      title: "Landslide Safety",
      color: darkMode ? "text-amber-400" : "text-amber-700",
      before: [
        "Learn about landslide warning signs in your area",
        "Plant ground cover on slopes",
        "Build retaining walls or plant vegetation",
        "Develop evacuation plan with family",
        "Monitor weather reports during heavy rainfall",
      ],
      during: [
        "Evacuate if you suspect danger",
        "Listen for unusual sounds (trees cracking, boulders knocking)",
        "Move away from the path of the landslide",
        "Run perpendicular to the landslide direction",
        "Alert neighbors if time permits",
      ],
      after: [
        "Stay away from the slide area",
        "Watch for flooding which may follow",
        "Check for injured and trapped persons",
        "Report broken utility lines",
        "Replant damaged ground as soon as possible",
      ],
    },

    fire: {
      icon: "🔥",
      title: "Fire Safety",
      color: darkMode ? "text-red-400" : "text-red-600",
      before: [
        "Install smoke alarms on every level",
        "Create and practice fire escape plan",
        "Keep fire extinguishers accessible",
        "Clear brush and vegetation around home",
        "Store flammable materials properly",
      ],
      during: [
        "Get out immediately - do not stop for belongings",
        "Stay low to avoid smoke inhalation",
        "Feel doors before opening (if hot, use alternate route)",
        "Close doors behind you to slow fire spread",
        "Call emergency services once safe",
      ],
      after: [
        "Do not return until authorities allow it",
        "Document damage for insurance",
        "Discard food exposed to heat or smoke",
        "Have property professionally cleaned",
        "Watch for hot spots that could reignite",
      ],
    },

    storm: {
      icon: "⛈️",
      title: "Storm Safety",
      color: darkMode ? "text-slate-300" : "text-slate-700",
      before: [
        "Trim trees and secure loose outdoor items",
        "Stock emergency supplies (flashlights, batteries)",
        "Know your shelter location",
        "Charge all electronic devices",
        "Fill bathtubs with water for emergency use",
      ],
      during: [
        "Stay indoors away from windows",
        "Avoid using electrical equipment",
        "Do not use landline phones during lightning",
        "Stay in interior rooms on lowest floor",
        "Monitor weather updates continuously",
      ],
      after: [
        "Stay away from downed power lines",
        "Avoid standing water (may be electrified)",
        "Inspect home for damage",
        "Use flashlights, not candles",
        "Report outages to utility companies",
      ],
    },
  };

  const disasters = Object.keys(safetyData);
  const textPrimary = darkMode ? "#ededed" : "#1e293b";
  const textSecondary = darkMode ? "#b3b3b3" : "#475569";
  const textMuted = darkMode ? "#8a8a8a" : "#64748b";
  const cardBg = darkMode ? "#2a2a2a" : "#ffffff";
  const cardBorder = darkMode ? "#3a3a3a" : "#e2e8f0";
  const headerBg = darkMode
    ? "linear-gradient(to right, #1e1e3a, #1a2535)"
    : "linear-gradient(to right, #eef2ff, #f0f9ff)";

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>
          Safety Guidelines
        </h1>
        <p className="mt-1" style={{ color: textMuted }}>
          Essential safety tips to protect yourself and your family during disasters
        </p>
      </div>

      {/* Disaster Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {disasters.map((disaster) => (
          <button
            key={disaster}
            onClick={() => setSelectedDisaster(disaster)}
            className="p-5 rounded-2xl shadow-sm border-2 transition-all hover:scale-105 hover:shadow-md"
            style={{
              backgroundColor:
                selectedDisaster === disaster
                  ? darkMode ? "#2d2d5a" : "#eef2ff"
                  : darkMode ? "#242424" : "#ffffff",
              borderColor:
                selectedDisaster === disaster
                  ? darkMode ? "#6366f1" : "#6366f1"
                  : darkMode ? "#3a3a3a" : "#e2e8f0",
            }}
          >
            <div className="text-4xl mb-2">{safetyData[disaster].icon}</div>
            <p
              className="text-sm font-semibold capitalize"
              style={{ color: textSecondary }}
            >
              {disaster}
            </p>
          </button>
        ))}
      </div>

      {/* Safety Card */}
      <div
        className="rounded-2xl border shadow-lg overflow-hidden"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}
      >
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{ background: headerBg, borderColor: cardBorder }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">{safetyData[selectedDisaster].icon}</span>
            <div>
              <h2 className={`text-2xl font-bold ${safetyData[selectedDisaster].color}`}>
                {safetyData[selectedDisaster].title}
              </h2>
              <p style={{ color: textMuted }}>Stay safe and prepared</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-10">
          {/* BEFORE */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: textPrimary }}>
              ⏰ Before the Disaster
            </h3>
            <ul className="mt-3 space-y-2">
              {safetyData[selectedDisaster].before.map((tip, index) => (
                <li key={index} className="flex gap-3" style={{ color: textSecondary }}>
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DURING */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: textPrimary }}>
              🚨 During the Disaster
            </h3>
            <ul className="mt-3 space-y-2">
              {safetyData[selectedDisaster].during.map((tip, index) => (
                <li key={index} className="flex gap-3" style={{ color: textSecondary }}>
                  <span className="text-orange-400 font-bold">!</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AFTER */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: textPrimary }}>
              ✅ After the Disaster
            </h3>
            <ul className="mt-3 space-y-2">
              {safetyData[selectedDisaster].after.map((tip, index) => (
                <li key={index} className="flex gap-3" style={{ color: textSecondary }}>
                  <span className="text-blue-400 font-bold">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Contact */}
        <div
          className="border-t p-5"
          style={{
            backgroundColor: darkMode ? "#2d1515" : "#fef2f2",
            borderColor: darkMode ? "#7f1d1d" : "#fecaca",
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">📞</span>
            <div className="text-center">
              <p className="font-bold" style={{ color: darkMode ? "#f87171" : "#b91c1c" }}>
                Emergency Contact Numbers
              </p>
              <p className="text-sm" style={{ color: darkMode ? "#fca5a5" : "#dc2626" }}>
                Police: 100 | Fire: 101 | Ambulance: 102 | Disaster: 108
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPage;