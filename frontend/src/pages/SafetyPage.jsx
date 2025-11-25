import React, { useState } from "react";

const SafetyPage = () => {
  const [selectedDisaster, setSelectedDisaster] = useState("earthquake");

  const safetyData = {
    earthquake: {
      icon: "🌍",
      title: "Earthquake Safety",
      color: "from-orange-500 to-red-600",
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
      color: "from-blue-500 to-cyan-600",
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
      color: "from-amber-600 to-orange-700",
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
      color: "from-red-500 to-orange-600",
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
      color: "from-gray-600 to-slate-700",
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Safety Guidelines</h1>
        <p className="text-gray-600 mt-1">
          Essential safety tips to protect yourself and your family during
          disasters
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Select Disaster Type
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {disasters.map((disaster) => (
            <button
              key={disaster}
              onClick={() => setSelectedDisaster(disaster)}
              className={`p-4 rounded-xl border-2 transition transform hover:scale-105 ${
                selectedDisaster === disaster
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="text-4xl mb-2">{safetyData[disaster].icon}</div>
              <div className="text-sm font-semibold text-gray-700 capitalize">
                {disaster}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div
          className={`bg-gradient-to-r ${safetyData[selectedDisaster].color} p-6 text-white`}
        >
          <div className="flex items-center gap-4">
            <div className="text-6xl">{safetyData[selectedDisaster].icon}</div>
            <div>
              <h2 className="text-3xl font-bold">
                {safetyData[selectedDisaster].title}
              </h2>
              <p className="text-white/90 mt-1">Stay safe and prepared</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⏰</span>
              <h3 className="text-xl font-bold text-gray-800">
                Before the Disaster
              </h3>
            </div>
            <ul className="space-y-2">
              {safetyData[selectedDisaster].before.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <span className="text-green-500 font-bold mt-1">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🚨</span>
              <h3 className="text-xl font-bold text-gray-800">
                During the Disaster
              </h3>
            </div>
            <ul className="space-y-2">
              {safetyData[selectedDisaster].during.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <span className="text-orange-500 font-bold mt-1">!</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✅</span>
              <h3 className="text-xl font-bold text-gray-800">
                After the Disaster
              </h3>
            </div>
            <ul className="space-y-2">
              {safetyData[selectedDisaster].after.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <span className="text-blue-500 font-bold mt-1">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-red-50 border-t-2 border-red-200 p-4">
          <div className="flex items-center justify-center gap-4">
            <span className="text-2xl">📞</span>
            <div className="text-center">
              <p className="font-bold text-red-700">
                Emergency Contact Numbers
              </p>
              <p className="text-sm text-red-600">
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
