import React, { useState } from "react";
const BASE_URL = "http://localhost:3000";

const emptyCyclone = {
  Sea_Surface_Temperature: "",
  Atmospheric_Pressure: "",
  Humidity: "",
  Wind_Shear: "",
  Vorticity: "",
  Latitude: "",
  Ocean_Depth: "",
  Proximity_to_Coastline: "",
  Pre_existing_Disturbance: "",
};

const emptyEarthquake = { Latitude: "", Longitude: "", Depth: "" };

const emptyFlood = {
  "Rainfall (mm)": "",
  "Temperature (°C)": "",
  "Humidity (%)": "",
  "River Discharge (m³/s)": "",
  "Water Level (m)": "",
  "Elevation (m)": "",
  "Land Cover": "",
  "Soil Type": "",
  "Population Density": "",
  Infrastructure: "",
  "Historical Floods": "",
};

const emptyForestFire = {
  X: "",
  Y: "",
  FFMC: "",
  DMC: "",
  DC: "",
  ISI: "",
  temp: "",
  RH: "",
  wind: "",
  rain: "",
};

export default function MLplugin() {
  const [tab, setTab] = useState("cyclone");

  const [cyclone, setCyclone] = useState(emptyCyclone);
  const [earthquake, setEarthquake] = useState(emptyEarthquake);
  const [flood, setFlood] = useState(emptyFlood);
  const [forestfire, setForestfire] = useState(emptyForestFire);

  const [results, setResults] = useState({}); 
  const [loading, setLoading] = useState({});

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  async function submitJson(endpoint, payloadKey, payload) {
    setLoading((prev) => ({ ...prev, [payloadKey]: true }));
    setResults((prev) => ({ ...prev, [payloadKey]: null }));

    // build full URL: if caller passed a relative path (starts with '/'),
    // prepend BASE_URL so requests go to your backend on port 3000
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${BASE_URL}${endpoint}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // handle non-2xx responses
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(`HTTP ${res.status}${text ? ` - ${text}` : ""}`);
      }

      const data = await res.json();
      setResults((prev) => ({ ...prev, [payloadKey]: { ok: true, data } }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [payloadKey]: { ok: false, error: err.message },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [payloadKey]: false }));
    }
  }


  const tabButton = (id, label) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-md font-medium focus:outline-none transition-colors ${
        tab === id
          ? "bg-indigo-600 text-white shadow"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  const renderResult = (key) => {
    const r = results[key];
    if (loading[key])
      return (
        <div className="mt-3 p-3 rounded-md bg-yellow-50 border border-yellow-200">
          Processing...
        </div>
      );
    if (!r) return null;
    if (r.ok)
      return (
        <div className="mt-3 p-3 rounded-md bg-blue-50 border border-blue-200">
          <div className="font-medium mb-2">Response:</div>
          <pre className="text-sm overflow-auto max-h-60">
            {JSON.stringify(r.data, null, 2)}
          </pre>
        </div>
      );
    return (
      <div className="mt-3 p-3 rounded-md bg-red-50 border border-red-200">
        Error: {r.error}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6">
        🌍 GeoAware Multi-Hazard Prediction
      </h1>

      <div className="flex gap-3 justify-center mb-6">
        {tabButton("cyclone", "Cyclone")}
        {tabButton("earthquake", "Earthquake")}
        {tabButton("flood", "Flood")}
        {tabButton("forestfire", "Forest Fire")}
      </div>

      <div>
        {/* Cyclone */}
        {tab === "cyclone" && (
          <section
            aria-labelledby="cyclone-heading"
            className="bg-white shadow-sm rounded-lg p-6"
          >
            <h2 id="cyclone-heading" className="text-lg font-medium mb-4">
              Cyclone Prediction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(cyclone).map((k) => (
                <label key={k} className="flex flex-col">
                  <span className="text-sm font-medium mb-1">
                    {k.replace(/_/g, " ")}
                  </span>
                  <input
                    name={k}
                    type="number"
                    step="any"
                    required
                    value={cyclone[k]}
                    onChange={handleChange(setCyclone)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  submitJson("/predict/cyclone", "cyclone", cyclone)
                }
                className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                Predict Cyclone
              </button>
              <button
                onClick={() => setCyclone(emptyCyclone)}
                className="px-4 py-2 rounded-md bg-gray-100"
              >
                Reset
              </button>
            </div>
            {renderResult("cyclone")}
          </section>
        )}

        {/* Earthquake */}
        {tab === "earthquake" && (
          <section
            aria-labelledby="earthquake-heading"
            className="bg-white shadow-sm rounded-lg p-6 mt-4"
          >
            <h2 id="earthquake-heading" className="text-lg font-medium mb-4">
              Earthquake Prediction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(earthquake).map((k) => (
                <label key={k} className="flex flex-col">
                  <span className="text-sm font-medium mb-1">{k}</span>
                  <input
                    name={k}
                    type="number"
                    step="any"
                    required
                    value={earthquake[k]}
                    onChange={handleChange(setEarthquake)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  submitJson("/predict/earthquake", "earthquake", earthquake)
                }
                className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium"
              >
                Predict Earthquake
              </button>
              <button
                onClick={() => setEarthquake(emptyEarthquake)}
                className="px-4 py-2 rounded-md bg-gray-100"
              >
                Reset
              </button>
            </div>
            {renderResult("earthquake")}
          </section>
        )}

        {/* Flood */}
        {tab === "flood" && (
          <section
            aria-labelledby="flood-heading"
            className="bg-white shadow-sm rounded-lg p-6 mt-4"
          >
            <h2 id="flood-heading" className="text-lg font-medium mb-4">
              Flood Prediction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(flood).map((k) => (
                <label key={k} className="flex flex-col">
                  <span className="text-sm font-medium mb-1">{k}</span>
                  <input
                    name={k}
                    type={k.match(/Land Cover|Soil Type/) ? "text" : "number"}
                    step={k.match(/Land Cover|Soil Type/) ? undefined : "any"}
                    required
                    value={flood[k]}
                    onChange={handleChange(setFlood)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => submitJson("/predict/flood", "flood", flood)}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium"
              >
                Predict Flood
              </button>
              <button
                onClick={() => setFlood(emptyFlood)}
                className="px-4 py-2 rounded-md bg-gray-100"
              >
                Reset
              </button>
            </div>
            {renderResult("flood")}
          </section>
        )}

        {/* Forest Fire */}
        {tab === "forestfire" && (
          <section
            aria-labelledby="forestfire-heading"
            className="bg-white shadow-sm rounded-lg p-6 mt-4"
          >
            <h2 id="forestfire-heading" className="text-lg font-medium mb-4">
              Forest Fire Prediction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.keys(forestfire).map((k) => (
                <label key={k} className="flex flex-col">
                  <span className="text-sm font-medium mb-1">{k}</span>
                  <input
                    name={k}
                    type="number"
                    step="any"
                    required
                    value={forestfire[k]}
                    onChange={handleChange(setForestfire)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  submitJson("/predict/forestfire", "forestfire", forestfire)
                }
                className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium"
              >
                Predict Fire
              </button>
              <button
                onClick={() => setForestfire(emptyForestFire)}
                className="px-4 py-2 rounded-md bg-gray-100"
              >
                Reset
              </button>
            </div>
            {renderResult("forestfire")}
          </section>
        )}
      </div>
    </div>
  );
}