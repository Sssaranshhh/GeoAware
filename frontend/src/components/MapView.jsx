// src/components/MapView.jsx
import React from "react";

export default function MapView() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="text-xl font-semibold mb-4">Landslide Risk Heatmap</div>
      <div className="h-[500px] w-full bg-gradient-to-tr from-indigo-100 to-sky-50 rounded-xl flex items-center justify-center text-gray-600">
        🗺️ Interactive Map Placeholder (Integrate Google Maps / Mapbox / Leaflet)
      </div>

      <div className="mt-4 flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-green-500" /> Low Risk
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-yellow-400" /> Moderate Risk
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-orange-500" /> High Risk
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-red-500" /> Critical Risk
        </div>
      </div>
    </div>
  );
}
