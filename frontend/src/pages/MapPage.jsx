import React from "react";
import MapView from "../components/map/MapView";

const MapPage = ({ darkMode }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: darkMode ? "#ededed" : "#1e293b" }}
        >
          Earthquake Risk Map 🌍
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: darkMode ? "#8a8a8a" : "#64748b" }}
        >
          View real-time earthquake risk across your region.
        </p>
      </div>

      <MapView />
    </div>
  );
};

export default MapPage;
