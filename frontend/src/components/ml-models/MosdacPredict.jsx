import React, { useState } from "react";
import axios from "axios";

const Field = ({ label, name, min, max, value, onChange }) => (
  <label style={{ display: "block", marginBottom: "12px" }}>
    {label} <small style={{ opacity: 0.6 }}>({min}–{max})</small>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      inputMode="numeric"
      style={{
        display: "block",
        marginTop: 6,
        padding: "10px",
        width: "100%",
        maxWidth: "280px",
        borderRadius: "6px",
        border: "1px solid #ccc",
      }}
    />
  </label>
);

export default function MosdacPredict() {
  const API = "http://localhost:8000/mosdac/predict";
  
  // Detect dark mode from localStorage
  const [darkMode, setDarkMode] = React.useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  
  // Listen for dark mode changes
  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("darkMode");
      setDarkMode(saved ? JSON.parse(saved) : false);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const [form, setForm] = useState({
    imc_mean: "",
    imc_pct_gt_5: "",
    imc_pct_gt_10: "",
    olr_mean: "",
    olr_pct_lt_220: "",
    olr_pct_lt_240: "",
    ctp_mean: "",
    ctp_pct_lt_200: "",
    ctp_pct_lt_300: "",
    latitude: "28.6139",
    longitude: "77.209",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const predict = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const required = [
      "imc_mean",
      "imc_pct_gt_5",
      "imc_pct_gt_10",
      "olr_mean",
      "olr_pct_lt_220",
      "olr_pct_lt_240",
      "ctp_mean",
      "ctp_pct_lt_200",
      "ctp_pct_lt_300",
      "latitude",
      "longitude",
    ];

    for (const k of required) {
      if (form[k] === "" || form[k] === null) {
        setError(`Please enter ${k.replace(/_/g, " ")}`);
        setLoading(false);
        return;
      }
    }

    const payload = {
      imc_mean: clamp(Number(form.imc_mean), 0, 50),
      imc_pct_gt_5: clamp(Number(form.imc_pct_gt_5), 0, 100),
      imc_pct_gt_10: clamp(Number(form.imc_pct_gt_10), 0, 100),
      olr_mean: clamp(Number(form.olr_mean), 180, 300),
      olr_pct_lt_220: clamp(Number(form.olr_pct_lt_220), 0, 100),
      olr_pct_lt_240: clamp(Number(form.olr_pct_lt_240), 0, 100),
      ctp_mean: clamp(Number(form.ctp_mean), 100, 400),
      ctp_pct_lt_200: clamp(Number(form.ctp_pct_lt_200), 0, 100),
      ctp_pct_lt_300: clamp(Number(form.ctp_pct_lt_300), 0, 100),
      latitude: clamp(Number(form.latitude), -90, 90),
      longitude: clamp(Number(form.longitude), -180, 180),
    };

    try {
      const res = await axios.post(API, payload, { timeout: 30000 });
      setResult(res.data);
    } catch (err) {
      console.error("ERROR:", err);
      if (err.response) {
        setError(
          `Prediction failed: ${err.response.status} - ${JSON.stringify(
            err.response.data
          )}`
        );
      } else if (err.request) {
        setError(
          "No response from server — check that Mosdac backend is running."
        );
      } else {
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🛰️ Mosdac Satellite Flood Risk Prediction</h1>
      <p style={{ opacity: 0.6 }}>
        Advanced flood risk analysis using satellite data (IMC, OLR, CTP)
      </p>

      <div style={{ marginTop: 20, maxWidth: 600 }}>
        <h3>📡 Satellite Data Parameters</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field
            label="IMC Mean (mm)"
            name="imc_mean"
            min={0}
            max={50}
            value={form.imc_mean}
            onChange={updateField}
          />
          <Field
            label="IMC >5mm (%)"
            name="imc_pct_gt_5"
            min={0}
            max={100}
            value={form.imc_pct_gt_5}
            onChange={updateField}
          />
          <Field
            label="IMC >10mm (%)"
            name="imc_pct_gt_10"
            min={0}
            max={100}
            value={form.imc_pct_gt_10}
            onChange={updateField}
          />

          <Field
            label="OLR Mean (K)"
            name="olr_mean"
            min={180}
            max={300}
            value={form.olr_mean}
            onChange={updateField}
          />
          <Field
            label="OLR <220K (%)"
            name="olr_pct_lt_220"
            min={0}
            max={100}
            value={form.olr_pct_lt_220}
            onChange={updateField}
          />
          <Field
            label="OLR <240K (%)"
            name="olr_pct_lt_240"
            min={0}
            max={100}
            value={form.olr_pct_lt_240}
            onChange={updateField}
          />

          <Field
            label="CTP Mean (m)"
            name="ctp_mean"
            min={100}
            max={400}
            value={form.ctp_mean}
            onChange={updateField}
          />
          <Field
            label="CTP <200 (%)"
            name="ctp_pct_lt_200"
            min={0}
            max={100}
            value={form.ctp_pct_lt_200}
            onChange={updateField}
          />
        </div>

        <Field
          label="CTP <300 (%)"
          name="ctp_pct_lt_300"
          min={0}
          max={100}
          value={form.ctp_pct_lt_300}
          onChange={updateField}
        />

        <h3 style={{ marginTop: 20 }}>📍 Location</h3>
        <Field
          label="Latitude"
          name="latitude"
          min={-90}
          max={90}
          value={form.latitude}
          onChange={updateField}
        />
        <Field
          label="Longitude"
          name="longitude"
          min={-180}
          max={180}
          value={form.longitude}
          onChange={updateField}
        />

        <button
          onClick={predict}
          disabled={loading}
          style={{
            marginTop: 20,
            padding: "10px 15px",
            background: "#2563eb",
            color: "white",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Analyzing..." : "Predict Flood Risk"}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: 20,
            background: "#fee2e2",
            padding: 12,
            color: "#b91c1c",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: darkMode ? "var(--bg-secondary)" : "#f8fbff",
            borderRadius: 8,
            border: `1px solid ${darkMode ? "var(--border-light)" : "#e0e7ff"}`,
            color: darkMode ? "var(--text-primary)" : "#000",
            transition: "var(--transition)"
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 15, color: darkMode ? "var(--accent-blue-light)" : "#1e40af", fontWeight: 600 }}>🛰️ Mosdac Satellite Analysis Result</h2>

          {/* Location And Risk Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 15 }}>
            <div style={{ background: darkMode ? "var(--bg-tertiary)" : "#fff", padding: 12, borderRadius: 8, border: `1px solid ${darkMode ? "var(--border-color)" : "#e0e7ff"}`, color: darkMode ? "var(--text-primary)" : "#000", transition: "var(--transition)" }}>
              <div style={{ fontSize: 12, color: darkMode ? "var(--text-secondary)" : "#525252", marginBottom: 5 }}>📍 Location</div>
              <div style={{ fontSize: 14, fontWeight: "bold", color: darkMode ? "var(--accent-blue-light)" : "#1e40af" }}>
                {result.location?.city || "Unknown"}, {result.location?.country}
              </div>
              <div style={{ fontSize: 11, color: darkMode ? "var(--text-tertiary)" : "#888", marginTop: 4 }}>
                {result.location?.latitude.toFixed(4)}, {result.location?.longitude.toFixed(4)}
              </div>
            </div>

            <div
              style={{
                background:
                  result.alert_level === "Red"
                    ? darkMode ? "#7f1d1d" : "#fee2e2"
                    : result.alert_level === "Yellow"
                    ? darkMode ? "#78350f" : "#fef3c7"
                    : darkMode ? "#15803d" : "#dcfce7",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            >
              <div style={{ fontSize: 12, color: "#525252", marginBottom: 5 }}>⚠️ Alert Level</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color:
                    result.alert_level === "Red"
                      ? "#991b1b"
                      : result.alert_level === "Yellow"
                      ? "#92400e"
                      : "#166534",
                }}
              >
                {result.alert_level}
              </div>
            </div>
          </div>

          {/* Risk Level and Score */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 15 }}>
            <div style={{ background: darkMode ? "#334155" : "#fff", padding: 12, borderRadius: 6, border: `1px solid ${darkMode ? "#475569" : "#ddd"}`, color: darkMode ? "#f1f5f9" : "#000" }}>
              <div style={{ fontSize: 12, color: darkMode ? "#cbd5e1" : "#525252", marginBottom: 5 }}>Risk Level</div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: darkMode ? "#60a5fa" : "#1e40af" }}>
                {result.model_prediction?.risk_level}
              </div>
            </div>
            <div style={{ background: darkMode ? "#334155" : "#fff", padding: 12, borderRadius: 6, border: `1px solid ${darkMode ? "#475569" : "#ddd"}`, color: darkMode ? "#f1f5f9" : "#000" }}>
              <div style={{ fontSize: 12, color: darkMode ? "#cbd5e1" : "#525252", marginBottom: 5 }}>Risk Score</div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: darkMode ? "#60a5fa" : "#1e40af" }}>
                {(result.risk_score * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Risk Probabilities */}
          {result.model_prediction?.probabilities && (
            <div style={{ background: darkMode ? "#334155" : "#fff", padding: 12, borderRadius: 6, marginBottom: 15, border: `1px solid ${darkMode ? "#475569" : "#ddd"}`, color: darkMode ? "#f1f5f9" : "#000" }}>
              <h4 style={{ marginTop: 0, color: darkMode ? "#60a5fa" : "#1e40af" }}>📊 Risk Probabilities</h4>
              {Object.entries(result.model_prediction.probabilities).map(([level, prob]) => (
                <div key={level} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: "bold", color: darkMode ? "#60a5fa" : "#1e40af" }}>{level}</span>
                    <span style={{ fontWeight: "bold", color: darkMode ? "#f1f5f9" : "#000" }}>{(prob * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ background: darkMode ? "#1e293b" : "#e0e7ff", height: 20, borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        background: "#3b82f6",
                        height: "100%",
                        width: `${prob * 100}%`,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Analysis */}
          {result.ai_analysis && (
            <div style={{ background: darkMode ? "#334155" : "#fff", padding: 12, borderRadius: 6, border: `1px solid ${darkMode ? "#475569" : "#ddd"}`, marginBottom: 15, color: darkMode ? "#f1f5f9" : "#000" }}>
              <h4 style={{ marginTop: 0, color: darkMode ? "#60a5fa" : "#1e40af" }}>🤖 AI Analysis</h4>
              <div style={{ marginBottom: 10 }}>
                <strong style={{ color: darkMode ? "#cbd5e1" : "#000" }}>Weather Interpretation:</strong>
                <p style={{ marginTop: 4, color: darkMode ? "#cbd5e1" : "#444", whiteSpace: "pre-wrap" }}>{result.ai_analysis.weather_interpretation}</p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <strong style={{ color: darkMode ? "#cbd5e1" : "#000" }}>Risk Reason:</strong>
                <p style={{ marginTop: 4, color: darkMode ? "#cbd5e1" : "#444", whiteSpace: "pre-wrap" }}>{result.ai_analysis.risk_reason}</p>
              </div>
              <div style={{ marginBottom: 10 }}>
                <strong style={{ color: darkMode ? "#cbd5e1" : "#000" }}>Advisory:</strong>
                <p style={{ marginTop: 4, color: darkMode ? "#cbd5e1" : "#444", whiteSpace: "pre-wrap" }}>{result.ai_analysis.advisory}</p>
              </div>
              {result.ai_analysis.preventive_actions && result.ai_analysis.preventive_actions.length > 0 && (
                <div>
                  <strong style={{ color: darkMode ? "#cbd5e1" : "#000" }}>Preventive Actions:</strong>
                  <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                    {result.ai_analysis.preventive_actions.map((action, idx) => (
                      <li key={idx} style={{ color: darkMode ? "#cbd5e1" : "#444", marginBottom: 6 }}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Graphs */}
          {result.graphs && (
            <div style={{ marginTop: 15 }}>
              <h3 style={{ color: darkMode ? "#60a5fa" : "#1e40af" }}>📊 Analysis Charts</h3>
              {Object.entries(result.graphs).map(([graphName, graph], idx) => (
                <div key={graphName} style={{ background: darkMode ? "#334155" : "#fff", padding: 15, borderRadius: 6, marginBottom: 15, border: `1px solid ${darkMode ? "#475569" : "#ddd"}`, color: darkMode ? "#f1f5f9" : "#000" }}>
                  <h5 style={{ marginTop: 0, color: darkMode ? "#60a5fa" : "#1e40af" }}>
                    {graphName.replace(/_/g, " ").toUpperCase()}
                  </h5>
                  {idx % 3 === 0 && <BarChart labels={graph.labels} values={graph.values} darkMode={darkMode} />}
                  {idx % 3 === 1 && <PieChart labels={graph.labels} values={graph.values} darkMode={darkMode} />}
                  {idx % 3 === 2 && <LineChart labels={graph.labels} values={graph.values} darkMode={darkMode} />}
                </div>
              ))}
            </div>
          )}

          {/* Model Info */}
          {result.model_info && (
            <div style={{ background: darkMode ? "#334155" : "#fff", padding: 12, borderRadius: 6, border: `1px solid ${darkMode ? "#475569" : "#ddd"}`, marginTop: 15, color: darkMode ? "#f1f5f9" : "#000" }}>
              <h4 style={{ marginTop: 0, color: darkMode ? "#60a5fa" : "#1e40af" }}>🔧 Model Information</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: darkMode ? "#cbd5e1" : "#525252" }}>Model Type</div>
                  <div style={{ fontSize: 14, fontWeight: "bold", color: darkMode ? "#60a5fa" : "#1e40af" }}>{result.model_info.model_type}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#525252" }}>Features Used</div>
                  <div style={{ fontSize: 14, fontWeight: "bold" }}>{result.model_info.num_features}</div>
                </div>
              </div>
              {result.model_info.feature_importance && Object.keys(result.model_info.feature_importance).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <strong>Feature Importance:</strong>
                  {Object.entries(result.model_info.feature_importance).map(([feat, imp]) => (
                    <div key={feat} style={{ marginTop: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                        <span>{feat.replace(/_/g, " ")}</span>
                        <span style={{ fontWeight: "bold" }}>{(imp * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ background: "#f0f0f0", height: 12, borderRadius: 2, overflow: "hidden" }}>
                        <div
                          style={{
                            background: "#10b981",
                            height: "100%",
                            width: `${imp * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generated At */}
          {result.generated_at && (
            <div style={{ marginTop: 15, fontSize: 12, color: "#888", textAlign: "center" }}>
              Generated at: {new Date(result.generated_at).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========== CHART COMPONENTS ==========

// Bar Chart Component
const BarChart = ({ labels, values, darkMode = false }) => {
  const maxValue = Math.max(...values, 1);
  
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "220px", marginTop: "15px", padding: "10px", background: darkMode ? "var(--bg-secondary)" : "linear-gradient(to right, #f0f4ff, #f8faff)", borderRadius: "6px" }}>
      {labels && labels.map((label, idx) => (
        <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: darkMode ? "#60a5fa" : "#1e3a8a" }}>
            {(values[idx] * 100).toFixed(1)}%
          </div>
          <div
            style={{
              width: "100%",
              height: `${(values[idx] / maxValue) * 160}px`,
              background: "linear-gradient(to top, #3b82f6, #60a5fa)",
              borderRadius: "6px 6px 0 0",
              minHeight: "10px",
              transition: "all 0.3s",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
            }}
          />
          <div style={{ fontSize: "10px", marginTop: "8px", textAlign: "center", color: darkMode ? "var(--text-secondary)" : "#525252", wordBreak: "break-word", maxWidth: "100%" }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
};

// Pie Chart Component
const PieChart = ({ labels, values, darkMode = false }) => {
  const total = values.reduce((a, b) => a + b, 1);
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#8b5cf6", "#ec4899", "#f43f5e"];
  let currentAngle = 0;
  
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "15px", padding: "10px" }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ flex: "0 0 auto" }}>
        {values.map((value, idx) => {
          const sliceAngle = (value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + sliceAngle;
          
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          
          const x1 = 100 + 80 * Math.cos(startRad);
          const y1 = 100 + 80 * Math.sin(startRad);
          const x2 = 100 + 80 * Math.cos(endRad);
          const y2 = 100 + 80 * Math.sin(endRad);
          
          const largeArc = sliceAngle > 180 ? 1 : 0;
          
          const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
          
          currentAngle += sliceAngle;
          
          return (
            <path
              key={idx}
              d={path}
              fill={colors[idx % colors.length]}
              stroke="white"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
            />
          );
        })}
      </svg>
      
      <div style={{ marginLeft: "20px", fontSize: "12px", color: darkMode ? "var(--text-primary)" : "#000" }}>
        {labels.map((label, idx) => (
          <div key={idx} style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
            <div style={{ width: "12px", height: "12px", background: colors[idx % colors.length], borderRadius: "2px", marginRight: "8px" }}></div>
            <span style={{ color: darkMode ? "#cbd5e1" : "#000" }}><strong>{label}</strong> - {(values[idx] * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Line Chart Component
const LineChart = ({ labels, values, darkMode = false }) => {
  const maxValue = Math.max(...values, 1);
  const width = Math.max(600, labels.length * 80);
  const height = 220;
  const padding = 40;
  const plotHeight = height - 2 * padding;
  const plotWidth = width - 2 * padding;
  
  const points = values.map((v, idx) => {
    const x = padding + (idx / (values.length - 1 || 1)) * plotWidth;
    const y = padding + plotHeight - (v / maxValue) * plotHeight;
    return { x, y };
  });
  
  const pathData = points.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  
  return (
    <div style={{ overflowX: "auto", marginTop: "15px" }}>
      <svg width={width} height={height} style={{ background: darkMode ? "rgba(30, 41, 59, 0.5)" : "linear-gradient(to right, #f0f4ff, #f8faff)", borderRadius: "6px" }}>
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <line key={`h${i}`} x1={padding} y1={padding + (i * plotHeight) / 4} x2={width - padding} y2={padding + (i * plotHeight) / 4} stroke={darkMode ? "#475569" : "#ddd"} strokeDasharray="4" />
        ))}
        
        {/* Area under line */}
        <path
          d={pathData + ` L ${points[points.length - 1].x} ${padding + plotHeight} L ${points[0].x} ${padding + plotHeight} Z`}
          fill="rgba(59, 130, 246, 0.1)"
        />
        
        {/* Line */}
        <path d={pathData} stroke="#3b82f6" strokeWidth="3" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))" }} />
        
        {/* Points */}
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="5" fill="#3b82f6" stroke={darkMode ? "#0f172a" : "white"} strokeWidth="2" />
        ))}
        
        {/* Y-axis labels */}
        {[...Array(5)].map((_, i) => (
          <text key={`yl${i}`} x={padding - 10} y={padding + (i * plotHeight) / 4 + 4} fontSize="11" textAnchor="end" fill={darkMode ? "#cbd5e1" : "#525252"}>
            {((1 - i / 4) * maxValue).toFixed(1)}
          </text>
        ))}
        
        {/* X-axis labels */}
        {labels.map((label, idx) => (
          <text key={`xl${idx}`} x={points[idx].x} y={height - 10} fontSize="10" textAnchor="middle" fill={darkMode ? "#cbd5e1" : "#525252"} style={{ wordWrap: "break-word" }}>
            {label.substring(0, 3)}
          </text>
        ))}
      </svg>
    </div>
  );
};
