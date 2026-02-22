import React, { useState } from "react";
const BASE_URL = import.meta.env.VITE_ML_URL;

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
  Rainfall: "",
  Temperature: "",
  Humidity: "",
  River_Discharge: "",
  Water_Level: "",
  Elevation: "",
  Land_Cover: "",
  Soil_Type: "",
  Population_Density: "",
  Infrastructure: "",
  Historical_Floods: "",
};

const floodLabels = {
  Rainfall: "Rainfall (mm)",
  Temperature: "Temperature (°C)",
  Humidity: "Humidity (%)",
  River_Discharge: "River Discharge (m³/s)",
  Water_Level: "Water Level (m)",
  Elevation: "Elevation (m)",
  Land_Cover: "Land Cover",
  Soil_Type: "Soil Type",
  Population_Density: "Population Density",
  Infrastructure: "Infrastructure",
  Historical_Floods: "Historical Floods",
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

export default function MLplugin({ darkMode = false }) {
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
      style={{
        padding: "8px 16px",
        borderRadius: "6px",
        fontWeight: "500",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backgroundColor: tab === id ? "#3b82f6" : (darkMode ? "#2a2a2a" : "#f3f4f6"),
        color: tab === id ? "white" : (darkMode ? "#b3b3b3" : "#374151"),
      }}
    >
      {label}
    </button>
  );

  const renderResult = (key) => {
    const r = results[key];
    if (loading[key])
      return (
        <div className="mt-3 p-3 rounded-md bg-yellow-50 border border-yellow-200">
          ⏳ Processing...
        </div>
      );
    if (!r) return null;
    if (r.ok) {
      const data = r.data;
      let riskColor = "bg-green-50";
      let riskIcon = "✅";

      if (data.risk === "High") {
        riskColor = "bg-red-50";
        riskIcon = "🚨";
      } else if (data.risk === "Medium") {
        riskColor = "bg-yellow-50";
        riskIcon = "⚠️";
      }

      return (
        <div className={`mt-3 p-4 rounded-md border-2 ${riskColor}`}>
          <div className="text-2xl font-bold mb-2">
            {riskIcon} Risk Level: <span className="text-indigo-700">{data.risk}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="text-sm text-gray-600">Confidence</div>
              <div className="text-lg font-semibold">{(data.confidence * 100).toFixed(1)}%</div>
            </div>
            {data.details && (
              <>
                {Object.entries(data.details).map(([k, v]) => (
                  <div key={k} className="bg-white p-3 rounded border border-gray-200">
                    <div className="text-sm text-gray-600 capitalize">{k.replace(/_/g, " ")}</div>
                    <div className="text-lg font-semibold">{typeof v === "number" ? v.toFixed(2) : v}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="mt-3 p-3 rounded-md bg-red-50 border border-red-200">
        ❌ Error: {r.error}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "24px", backgroundColor: darkMode ? "#191919" : "#ffffff", color: darkMode ? "#ededed" : "#000000", borderRadius: "12px", transition: "all 0.2s ease" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "600", textAlign: "center", marginBottom: "24px", color: darkMode ? "#ededed" : "#000000" }}>
        🌍 GeoAware Multi-Hazard Prediction
      </h1>

      <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
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
            style={{
              backgroundColor: darkMode ? "#202020" : "#ffffff",
              color: darkMode ? "#ededed" : "#000000",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: darkMode ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2 id="cyclone-heading" style={{ fontSize: "18px", fontWeight: "500", marginBottom: "16px", color: darkMode ? "#ededed" : "#000000" }}>
              Cyclone Prediction
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
              {Object.keys(cyclone).map((k) => (
                <label key={k} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: darkMode ? "#b3b3b3" : "#374151" }}>
                    {k.replace(/_/g, " ")}
                  </span>
                  <input
                    name={k}
                    type="number"
                    step="any"
                    required
                    value={cyclone[k]}
                    onChange={handleChange(setCyclone)}
                    style={{
                      padding: "8px",
                      border: `1px solid ${darkMode ? "#2f2f2f" : "#d1d5db"}`,
                      borderRadius: "6px",
                      backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
                      color: darkMode ? "#ededed" : "#000000",
                      fontSize: "14px",
                      outline: "none",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.backgroundColor = darkMode ? "#2f2f2f" : "#f9fafb";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = darkMode ? "#2f2f2f" : "#d1d5db";
                      e.target.style.backgroundColor = darkMode ? "#2a2a2a" : "#ffffff";
                    }}
                  />
                </label>
              ))}
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
              <button
                onClick={() =>
                  submitJson("/predict/cyclone", "cyclone", cyclone)
                }
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  fontWeight: "500",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Predict Cyclone
              </button>
              <button
                onClick={() => setCyclone(emptyCyclone)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  backgroundColor: darkMode ? "#2a2a2a" : "#f3f4f6",
                  color: darkMode ? "#b3b3b3" : "#374151",
                  fontWeight: "500",
                  border: `1px solid ${darkMode ? "#2f2f2f" : "#d1d5db"}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
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
            style={{
              backgroundColor: darkMode ? "#202020" : "#ffffff",
              color: darkMode ? "#ededed" : "#000000",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: darkMode ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.1)",
              marginTop: "16px",
            }}
          >
            <h2 id="earthquake-heading" style={{ fontSize: "18px", fontWeight: "500", marginBottom: "16px", color: darkMode ? "#ededed" : "#000000" }}>
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
                  <span className="text-sm font-medium mb-1">{floodLabels[k]}</span>
                  <input
                    name={k}
                    type={k.match(/Land_Cover|Soil_Type/) ? "text" : "number"}
                    step={k.match(/Land_Cover|Soil_Type/) ? undefined : "any"}
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