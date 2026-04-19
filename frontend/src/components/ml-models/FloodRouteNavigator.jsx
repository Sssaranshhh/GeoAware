import { useEffect, useState } from "react";
import axios from "axios";

export default function FloodRouteNavigator({ darkMode = false }) {
  const API_BASE = import.meta.env.VITE_ML_URL;
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
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          fontSize: "14px",
          border: "1px solid var(--border-light)",
          transition: "var(--transition)"
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
              border: "1px solid var(--border-light)",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              transition: "var(--transition)"
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
            border: "1px solid var(--border-light)",
            background: "var(--bg-secondary)",
            color: "var(--accent-blue)",
            fontSize: "13px",
            cursor: "pointer",
            transition: "var(--transition)"
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
            background: backendOnline ? "var(--accent-blue)" : "var(--bg-tertiary)",
            color: backendOnline ? "white" : "var(--text-tertiary)",
            fontWeight: 600,
            transition: "var(--transition)"
          }}
        >
          {loading ? "Analyzing route…" : "Analyze Flood Risk Along Route"}
        </button>
        {!backendOnline && (
          <p style={{ fontSize: "12px", color: "var(--status-danger)", marginTop: "4px" }}>
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
            background: "rgba(239, 68, 68, 0.2)",
            color: "var(--status-danger)",
            fontSize: "13px",
            border: "1px solid var(--status-danger)",
            transition: "var(--transition)"
          }}
        >
          <strong>Error: </strong>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{errorMsg}</pre>
        </div>
      )}

      {/* Formatted result */}
      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "8px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-light)",
            color: "var(--text-primary)",
            transition: "var(--transition)"
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
            ✅ Route Analysis Complete
          </h3>

          {/* Safe Route Indicator */}
          {result.safe_route !== undefined && (
            <div
              style={{
                background: "white",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "12px",
              }}
            >
              <strong>🛣️ Safe Route:</strong>{" "}
              <span
                style={{
                  color: result.safe_route ? "#16a34a" : "#b91c1c",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                {result.safe_route ? "✅ YES - Safe to take" : "❌ NO - High risk"}
              </span>
            </div>
          )}

          {/* Risk Level */}
          {result.risk_level && (
            <div
              style={{
                background: "white",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "12px",
              }}
            >
              <strong>📊 Overall Risk Level:</strong>{" "}
              <span
                style={{
                  background:
                    result.risk_level === "High"
                      ? "#dc2626"
                      : result.risk_level === "Medium"
                        ? "#ea580c"
                        : "#16a34a",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                {result.risk_level}
              </span>
            </div>
          )}

          {/* Risk Description */}
          {result.risk_description && (
            <div
              style={{
                background: "var(--bg-tertiary)",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "12px",
                border: "1px solid var(--border-light)",
                transition: "var(--transition)"
              }}
            >
              <strong style={{ color: "var(--text-primary)" }}>\ud83d\udde3 Description:</strong>
              <p style={{ marginTop: "6px", color: "var(--text-secondary)" }}>{result.risk_description}</p>
            </div>
          )}

          {/* Waypoint Risks */}
          {result.waypoint_risks && Array.isArray(result.waypoint_risks) && (
            <div
              style={{
                background: "white",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "12px",
              }}
            >
              <strong>📍 Waypoint Risks ({result.waypoint_risks.length}):</strong>
              <div style={{ marginTop: "8px", maxHeight: "400px", overflowY: "auto" }}>
                {result.waypoint_risks.map((wp, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "8px",
                      marginBottom: "6px",
                      background: "#f3f4f6",
                      borderRadius: "4px",
                      fontSize: "13px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>Waypoint #{idx}</strong>
                      <span
                        style={{
                          background:
                            wp.risk_level === "High"
                              ? "#dc2626"
                              : wp.risk_level === "Medium"
                                ? "#ea580c"
                                : "#16a34a",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "3px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {wp.risk_level}
                      </span>
                    </div>
                    {wp.location && (
                      <div style={{ fontSize: "11px", color: "#525252", marginTop: "4px" }}>
                        📍 {wp.location.latitude.toFixed(4)}, {wp.location.longitude.toFixed(4)}
                      </div>
                    )}
                    {wp.details && (
                      <div style={{ fontSize: "11px", color: "#525252", marginTop: "4px" }}>
                        {Object.entries(wp.details).map(([key, val]) => (
                          <div key={key}><strong>{key}:</strong> {typeof val === "number" ? val.toFixed(2) : val}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Distance Info */}
          {result.total_distance !== undefined && (
            <div
              style={{
                background: "var(--bg-tertiary)",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "12px",
                border: "1px solid var(--border-light)",
                transition: "var(--transition)"
              }}
            >
              <strong style={{ color: "var(--text-primary)" }}>\ud83d\udccf Distance:</strong> <span style={{ color: "var(--accent-blue)" }}>{result.total_distance.toFixed(2)} km</span>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
            <div
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid var(--accent-blue)",
                transition: "var(--transition)"
              }}
            >
              <strong style={{ color: "var(--accent-blue)" }}>\ud83d\udca1 Recommendations:</strong>
              <ul style={{ marginTop: "8px", paddingLeft: "20px", color: "var(--text-secondary)" }}>
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: "4px" }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
  border: "1px solid var(--border-light)",
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
  minWidth: "160px",
  transition: "var(--transition)"
};

const smallButtonStyle = {
  padding: "4px 8px",
  borderRadius: "6px",
  border: "none",
  background: "var(--status-danger)",
  color: "white",
  cursor: "pointer",
  fontSize: "12px",
  transition: "var(--transition)"
};
