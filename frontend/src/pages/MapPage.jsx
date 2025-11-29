import React from "react";
import MapView from "../components/map/MapView";

const MapPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Earthquake Risk Map 🌍
        </h2>
        <p className="text-slate-600 text-sm">
          View real-time earthquake risk across your region.
        </p>
      </div>

      <MapView />
    </div>
  );
};

export default MapPage;
