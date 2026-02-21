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
      } catch (err) {
        console.error("Backend check failed:", err.message);
        setBackendOnline(false);
        // Try fallback endpoints
        try {
          const health2 = await axios.get(`${API}/health`, { timeout: 2000 });
          setBackendOnline(true);
        } catch (err2) {
          setBackendOnline(false);
        }
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
            <div
              style={{
                background: "#f0f9ff",
                padding: "15px",
                marginTop: "20px",
                borderRadius: "6px",
                border: "1px solid #0084ff",
              }}
            >
              <h3 style={{ marginTop: 0 }}>📊 Location Analysis Results</h3>
              
              {locationResult.location && (
                <div style={{ background: "white", padding: "12px", borderRadius: "6px", marginBottom: "12px" }}>
                  <p>
                    <strong>📍 Location:</strong> {locationResult.location.address || locationResult.location.city ||
                      locationResult.location.state || locationResult.location.country}
                  </p>
                  {locationResult.location.latitude && (
                    <p style={{ fontSize: "12px", color: "#525252" }}>
                      Coordinates: {locationResult.location.latitude.toFixed(4)}, {locationResult.location.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              )}
              
              {locationResult.aqi && (
                <div style={{ background: "white", padding: "12px", borderRadius: "6px", marginBottom: "12px" }}>
                  <p>
                    <strong>AQI Score:</strong> {locationResult.aqi.aqi}{" "}
                    <span
                      style={{
                        background:
                          locationResult.aqi.aqi > 200
                            ? "#dc2626"
                            : locationResult.aqi.aqi > 150
                            ? "#ea580c"
                            : locationResult.aqi.aqi > 100
                            ? "#eab308"
                            : "#22c55e",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {locationResult.aqi.category}
                    </span>
                  </p>
                  
                  <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>
                      <strong>PM2.5:</strong> <span style={{ fontSize: "14px" }}>{locationResult.aqi.pm25} µg/m³</span>
                    </div>
                    <div>
                      <strong>PM10:</strong> <span style={{ fontSize: "14px" }}>{locationResult.aqi.pm10} µg/m³</span>
                    </div>
                  </div>
                  
                  {locationResult.aqi.pollutants && Object.keys(locationResult.aqi.pollutants).length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      <strong>Pollutants:</strong>
                      <div style={{ fontSize: "12px", color: "#525252", marginTop: "6px" }}>
                        {Object.entries(locationResult.aqi.pollutants).map(([pollutant, value]) => (
                          <div key={pollutant} style={{ marginBottom: "4px" }}>
                            {pollutant}: {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {locationResult.aqi.effects && (
                    <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #ddd" }}>
                      <strong>Health Effects:</strong>
                      <p style={{ fontSize: "12px", color: "#525252", marginTop: "4px" }}>
                        {locationResult.aqi.effects}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
            <div
              style={{
                background: "#f0fdf4",
                padding: "15px",
                marginTop: "20px",
                borderRadius: "6px",
                border: "1px solid #16a34a",
              }}
            >
              <h3 style={{ marginTop: 0 }}>🛣️ Route Analysis Results</h3>
              
              {routeResult.route_summary && (
                <div style={{ background: darkMode ? "var(--bg-tertiary)" : "white", padding: "12px", borderRadius: "8px", marginBottom: "12px", border: `1px solid ${darkMode ? "var(--border-light)" : "#e0e7ff"}`, transition: "var(--transition)", color: darkMode ? "var(--text-primary)" : "#000" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <strong style={{ color: darkMode ? "var(--text-secondary)" : "#666" }}>📏 Total Distance:</strong> 
                      <p style={{ marginTop: "4px", fontSize: "14px", fontWeight: "bold", color: darkMode ? "var(--accent-blue-light)" : "#16a34a" }}>
                        {routeResult.route_summary.total_distance?.toFixed(2)} km
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: darkMode ? "var(--text-secondary)" : "#666" }}>📊 Average AQI:</strong> 
                      <p style={{ marginTop: "4px", fontSize: "14px", fontWeight: "bold", color: darkMode ? "var(--accent-blue-light)" : "#16a34a" }}>
                        {routeResult.route_summary.avg_aqi?.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <strong style={{ color: darkMode ? "var(--text-primary)" : "#000" }}>Risk Level:</strong> 
                    <span
                      style={{
                        marginLeft: "8px",
                        background:
                          routeResult.route_summary.risk_level === "High"
                            ? darkMode ? "rgba(239, 68, 68, 0.2)" : "#fecaca"
                            : routeResult.route_summary.risk_level === "Medium"
                            ? darkMode ? "rgba(249, 115, 22, 0.2)" : "#fed7aa"
                            : darkMode ? "rgba(34, 197, 94, 0.2)" : "#bbf7d0",
                        color: routeResult.route_summary.risk_level === "High"
                            ? darkMode ? "var(--status-danger)" : "#dc2626"
                            : routeResult.route_summary.risk_level === "Medium"
                            ? darkMode ? "var(--status-warning)" : "#ea580c"
                            : darkMode ? "var(--status-success)" : "#16a34a",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {routeResult.route_summary.risk_level}
                    </span>
                  </div>
                  {routeResult.route_summary.recommendation && (
                    <p style={{ marginTop: "10px", fontSize: "12px", color: darkMode ? "var(--text-secondary)" : "#525252", lineHeight: "1.6" }}>
                      <strong style={{ color: darkMode ? "var(--accent-blue)" : "#1e40af" }}>Recommendation:</strong> {routeResult.route_summary.recommendation}
                    </p>
                  )}
                </div>
              )}
              
              {routeResult.points && routeResult.points.length > 0 && (
                <div style={{ background: darkMode ? "var(--bg-tertiary)" : "white", padding: "12px", borderRadius: "8px", border: `1px solid ${darkMode ? "var(--border-color)" : "#ddd"}`, transition: "var(--transition)", color: darkMode ? "var(--text-primary)" : "#000" }}>
                  <strong style={{ color: darkMode ? "var(--text-primary)" : "#000" }}>📍 Waypoints ({routeResult.points.length}):</strong>
                  <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "8px" }}>
                    {routeResult.points.map((pt, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: darkMode ? "var(--bg-secondary)" : "#f9fafb",
                          padding: "8px",
                          margin: "4px 0",
                          borderRadius: "6px",
                          fontSize: "12px",
                          borderLeft: `3px solid ${
                            pt.aqi > 150 ? darkMode ? "var(--status-danger)" : "#dc2626" : pt.aqi > 100 ? darkMode ? "var(--status-warning)" : "#ea580c" : darkMode ? "var(--status-success)" : "#22c55e"
                          }`,
                          transition: "var(--transition)"
                        }}
                      >
                        <div style={{ fontWeight: "bold", color: darkMode ? "var(--text-primary)" : "#000" }}>Waypoint #{idx}</div>
                        <div style={{ color: darkMode ? "var(--text-secondary)" : "#666", marginTop: "2px" }}>AQI: <strong style={{ color: darkMode ? "var(--accent-blue)" : "#1e40af" }}>{pt.aqi}</strong> ({pt.category})</div>
                        {pt.coordinates && (
                          <div style={{ fontSize: "11px", color: darkMode ? "var(--text-tertiary)" : "#888", marginTop: "2px" }}>
                            📍 {pt.coordinates.latitude?.toFixed(4)}, {pt.coordinates.longitude?.toFixed(4)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
