import { useState, useEffect } from "react";
import axios from "axios";

export default function AirQuality() {
  // Backend URL (change if deployed later)
  const API = "http://localhost:8000";

  const [backendOnline, setBackendOnline] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // ---- Location States ----
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.209);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationResult, setLocationResult] = useState(null);

  // ---- Route States ----
  const [routePoints, setRoutePoints] = useState([
    { latitude: 28.6139, longitude: 77.209 },
    { latitude: 28.62, longitude: 77.215 },
  ]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);

  const [tab, setTab] = useState("location");

  // ---- Check server on load ----
  useEffect(() => {
    (async () => {
      try {
        const health = await axios.get(`${API}/health`);
        if (health.status === 200) setBackendOnline(true);

        const modelStatus = await axios.get(`${API}/models/status`);
        if (modelStatus.data?.ml_initialized) setModelsLoaded(true);
      } catch {
        setBackendOnline(false);
      }
    })();
  }, []);

  // ---- Single Location API Call ----
  const analyzeLocation = async () => {
    setLocationLoading(true);
    setLocationResult(null);

    try {
      const res = await axios.post(`${API}/analyze/location`, {
        latitude: Number(lat),
        longitude: Number(lon),
      });
      setLocationResult(res.data);
    } catch (err) {
      alert("❌ Error analyzing location");
      console.error(err);
    }
    setLocationLoading(false);
  };

  // ---- Route API Call ----
  const analyzeRoute = async () => {
    setRouteLoading(true);
    setRouteResult(null);

    try {
      const formatted = routePoints.map((p, i) => ({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        order: i,
      }));

      const res = await axios.post(`${API}/analyze/route`, {
        points: formatted,
        snap_to_roads: false,
      });
      setRouteResult(res.data);
    } catch (err) {
      alert("❌ Error analyzing route");
      console.error(err);
    }

    setRouteLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🌍 Air Quality Intelligence</h1>
      <p style={{ opacity: 0.7 }}>
        Backend: {backendOnline ? "🟢 Online" : "🔴 Offline"}
      </p>
      <p style={{ opacity: 0.7 }}>
        Models Loaded: {modelsLoaded ? "🟢 Yes" : "🟡 No"}
      </p>

      {/* Tabs */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setTab("location")}
          style={{
            padding: "10px 15px",
            background: tab === "location" ? "#08f" : "#333",
            color: "white",
            borderRadius: "6px",
          }}
        >
          Location Mode
        </button>

        <button
          onClick={() => setTab("route")}
          style={{
            padding: "10px 15px",
            background: tab === "route" ? "#08f" : "#333",
            color: "white",
            borderRadius: "6px",
          }}
        >
          Route Mode
        </button>
      </div>

      {/* LOCATION UI */}
      {tab === "location" && (
        <div style={{ marginTop: "20px" }}>
          <h2>📍 Analyze a Single Location</h2>

          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            style={{ padding: "8px", marginRight: "10px" }}
          />

          <input
            type="number"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="Longitude"
            style={{ padding: "8px" }}
          />

          <br />
          <br />

          <button
            onClick={analyzeLocation}
            disabled={locationLoading}
            style={{
              padding: "10px 15px",
              background: "#28a745",
              color: "white",
              borderRadius: "6px",
            }}
          >
            {locationLoading ? "Analyzing..." : "Analyze"}
          </button>

          {/* Response */}
          {locationResult && (
            <pre
              style={{
                background: "#111",
                color: "#0f0",
                padding: "15px",
                marginTop: "20px",
                borderRadius: "6px",
              }}
            >
              {JSON.stringify(locationResult, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* ROUTE UI */}
      {tab === "route" && (
        <div style={{ marginTop: "20px" }}>
          <h2>🚗 Analyze Route (Polyline)</h2>

          {routePoints.map((p, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <input
                type="number"
                placeholder="Lat"
                value={p.latitude}
                onChange={(e) => {
                  const copy = [...routePoints];
                  copy[i].latitude = e.target.value;
                  setRoutePoints(copy);
                }}
                style={{ padding: "8px", marginRight: "10px" }}
              />

              <input
                type="number"
                placeholder="Lon"
                value={p.longitude}
                onChange={(e) => {
                  const copy = [...routePoints];
                  copy[i].longitude = e.target.value;
                  setRoutePoints(copy);
                }}
                style={{ padding: "8px" }}
              />
            </div>
          ))}

          <button
            onClick={() =>
              setRoutePoints([...routePoints, { latitude: "", longitude: "" }])
            }
            style={{
              padding: "6px 10px",
              margin: "10px 0",
              borderRadius: "6px",
            }}
          >
            ➕ Add Point
          </button>

          <br />

          <button
            onClick={analyzeRoute}
            disabled={routeLoading}
            style={{
              padding: "10px 15px",
              background: "#28a745",
              color: "white",
              borderRadius: "6px",
            }}
          >
            {routeLoading ? "Analyzing..." : "Analyze Route"}
          </button>

          {routeResult && (
            <pre
              style={{
                background: "#111",
                color: "#0f0",
                padding: "15px",
                marginTop: "20px",
                borderRadius: "6px",
              }}
            >
              {JSON.stringify(routeResult, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
