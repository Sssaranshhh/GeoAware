import React from "react";
import MapView from "../components/map/MapView";

const MapPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Earthquake Risk Map
        </h1>
        <p className="text-gray-600 mt-1">
          View real-time earthquake data and risk zones across India
        </p>
      </div>
      <MapView />
    </div>
  );
};

export default MapPage;
