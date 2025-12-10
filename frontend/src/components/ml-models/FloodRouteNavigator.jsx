import { useEffect, useState } from "react";
import axios from "axios";

export default function FloodRouteNavigator() {
  const API_BASE = "http://localhost:8000";
  // Check your Swagger docs at /docs and update this if different
  
  const DEFAULT_ROUTE_ENDPOINT = "/route/safe"; // e.g. "/routes/analyze", "/flood/route", etc.

  const [backendOnline, setBackendOnline] = useState(false);
  const [healthInfo, setHealthInfo] = useState(null);

  const [routeEndpoint, setRouteEndpoint] = useState(DEFAULT_ROUTE_ENDPOINT);


  const [routePoints, setRoutePoints] = useState([
    { latitude: 28.6139, longitude: 77.209 },
    { latitude: 28.62, longitude: 77.215 },
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Optional: some extra metadata if your flood API uses it later
  const [scenario, setScenario] = useState("baseline"); // e.g. "baseline" / "24h_rain" / "extreme"
  const [departureTime, setDepartureTime] = useState("");

  // ─────────────────────────────────
  // Health check on mount
  // ─────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/health`);
        setBackendOnline(true);
        setHealthInfo(res.data);
      } catch (err) {
        console.error(err);
        setBackendOnline(false);
        setHealthInfo(null);
      }
    })();
  }, []);


  // ─────────────────────────────────
  // Helpers to modify route points
  // ─────────────────────────────────
  const updatePoint = (index, field, value) => {
    setRoutePoints((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addPoint = () => {
    setRoutePoints((prev) => [...prev, { latitude: "", longitude: "" }]);
  };

  const removePoint = (index) => {
    setRoutePoints((prev) => prev.filter((_, i) => i !== index));
  };

  // ─────────────────────────────────
  // Call flood route API
  // ─────────────────────────────────
  const analyzeFloodRoute = async () => {
    setLoading(true);
    setResult(null);
    setErrorMsg("");

    try {
      const payloadPoints = routePoints.map((p, idx) => ({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        order: idx,
      }));

      if (payloadPoints.length < 2) {
        setErrorMsg("Need at least 2 route points (origin + destination).");
        setLoading(false);
        return;
      }

      // origin = first point, dest = last point
      const origin = payloadPoints[0];
      const dest = payloadPoints[payloadPoints.length - 1];

      // Build body to match server expectations (origin/dest fields required)
      const body = {
        origin_lat: origin.latitude,
        origin_lon: origin.longitude,
        dest_lat: dest.latitude,
        dest_lon: dest.longitude,

        // include the full points array just in case backend uses it
        points: payloadPoints,

        // optional fields
        scenario: scenario || undefined,
        departure_time: departureTime || undefined,
      };

      console.log("POSTing to:", `${API_BASE}${routeEndpoint}`, body);

      const res = await axios.post(`${API_BASE}${routeEndpoint}`, body);
      setResult(res.data);
    } catch (err) {
      console.error(err);

      const serverData = err.response?.data;

      const formatValidation = (detail) => {
        if (Array.isArray(detail)) {
          return detail
            .map((d) => {
              const loc = Array.isArray(d.loc) ? d.loc.join(".") : d.loc;
              return `${loc}: ${d.msg}`;
            })
            .join("\n");
        }
        return typeof detail === "object"
          ? JSON.stringify(detail, null, 2)
          : String(detail);
      };

      const readable = serverData
        ? serverData.detail
          ? formatValidation(serverData.detail)
          : JSON.stringify(serverData, null, 2)
        : "Request failed – check console and make sure endpoint + payload match backend";

      setErrorMsg(readable);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🌊 Flood Route Safety Navigator</h1>
      <p style={{ opacity: 0.7 }}>
        Base URL: <code>{API_BASE}</code>
      </p>

      {/* Health status */}
      <div
        style={{
          marginTop: "10px",
          padding: "10px 12px",
          borderRadius: "8px",
          background: "#111827",
          color: "white",
          fontSize: "14px",
        }}
      >
        <div>
          Backend:{" "}
          {backendOnline
            ? "🟢 Online"
            : "🔴 Not reachable (check that flood server is running)"}
        </div>
        {healthInfo && (
          <div style={{ marginTop: "4px", opacity: 0.8 }}>
            status: {healthInfo.status ?? JSON.stringify(healthInfo)}
          </div>
        )}
      </div>

      {/* Endpoint selector */}
      <div style={{ marginTop: "16px" }}>
        <label style={{ fontSize: "14px" }}>
          Flood route endpoint path (from <code>/docs</code>):
          <input
            type="text"
            value={routeEndpoint}
            onChange={(e) => setRouteEndpoint(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              maxWidth: "400px",
              marginTop: "6px",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #374151",
              background: "#020617",
              color: "white",
            }}
          />
        </label>
        <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
          Default guess: <code>/analyze/route</code>. Check the actual path in
          your FastAPI Swagger docs at <code>http://localhost:8000/docs</code>{" "}
          and update if needed.
        </p>
      </div>

      {/* Route points builder */}
      <div style={{ marginTop: "20px" }}>
        <h2>🚗 Route waypoints</h2>
        <p style={{ fontSize: "13px", opacity: 0.7 }}>
          Define your route as a list of latitude/longitude points. These will
          be sent to the flood model as an ordered polyline.
        </p>

        {routePoints.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "13px", width: "24px" }}>#{i}</span>
            <input
              type="number"
              value={p.latitude}
              onChange={(e) => updatePoint(i, "latitude", e.target.value)}
              placeholder="Latitude"
              step="0.0001"
              style={inputStyle}
            />
            <input
              type="number"
              value={p.longitude}
              onChange={(e) => updatePoint(i, "longitude", e.target.value)}
              placeholder="Longitude"
              step="0.0001"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => removePoint(i)}
              disabled={routePoints.length <= 2}
              style={smallButtonStyle}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addPoint}
          style={{
            marginTop: "10px",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #4b5563",
            background: "#020617",
            color: "white",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          ➕ Add waypoint
        </button>
      </div>

      {/* Optional extra fields (only if backend uses them) */}
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ fontSize: "16px" }}>Optional parameters</h3>
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontSize: "13px" }}>
            Scenario (optional)
            <input
              type="text"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="baseline / heavy_rain / etc"
              style={inputStyle}
            />
          </label>
          <label style={{ fontSize: "13px" }}>
            Departure time (optional)
            <input
              type="text"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              placeholder="2025-12-08T14:00:00Z"
              style={inputStyle}
            />
          </label>
        </div>
        <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
          If your backend doesn’t use these fields, you can leave them as is or
          ignore them. They’re just included in the JSON payload.
        </p>
      </div>

      {/* Run analysis */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={analyzeFloodRoute}
          disabled={loading || !backendOnline}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: backendOnline ? "pointer" : "not-allowed",
            background: backendOnline ? "#22c55e" : "#4b5563",
            color: "white",
            fontWeight: 600,
          }}
        >
          {loading ? "Analyzing route…" : "Analyze Flood Risk Along Route"}
        </button>
        {!backendOnline && (
          <p style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>
            Start your flood FastAPI server first (uvicorn main:app --reload).
          </p>
        )}
      </div>

      {/* Errors */}
      {errorMsg && (
        <div
          style={{
            marginTop: "16px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "#7f1d1d",
            color: "white",
            fontSize: "13px",
          }}
        >
          <strong>Error: </strong>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{errorMsg}</pre>
        </div>
      )}

      {/* Raw JSON result */}
      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            borderRadius: "8px",
            background: "#020617",
            color: "#e5e7eb",
            fontSize: "13px",
            overflowX: "auto",
          }}
        >
          <div style={{ marginBottom: "6px", fontWeight: 600 }}>
            API response
          </div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// small shared styles
const inputStyle = {
  display: "block",
  marginTop: "4px",
  padding: "6px 8px",
  borderRadius: "6px",
  border: "1px solid #4b5563",
  background: "#020617",
  color: "white",
  minWidth: "160px",
};

const smallButtonStyle = {
  padding: "4px 8px",
  borderRadius: "6px",
  border: "none",
  background: "#b91c1c",
  color: "white",
  cursor: "pointer",
  fontSize: "12px",
};
