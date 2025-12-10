import React, { useState, useCallback, memo } from "react";
import axios from "axios";

const Field = memo(function Field({ label, name, min, max, value, onChange }) {
  return (
    <label style={{ display: "block", marginBottom: "12px" }}>
      {label}{" "}
      <small style={{ opacity: 0.6 }}>
        ({min}–{max})
      </small>
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
});

export default function FloodPredict() {
  const API = "http://localhost:8000/api/v1/predict";

  const [form, setForm] = useState({
    rainfall: "",
    river_level: "",
    soil_moisture: "",
    land_slope: "",
    population_density: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // stable handler
  const updateField = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  // clamp helper (optional)
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const predict = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    // Basic client-side validation
    const required = [
      "rainfall",
      "river_level",
      "soil_moisture",
      "land_slope",
      "population_density",
    ];
    for (const k of required) {
      if (form[k] === "" || form[k] === null) {
        setError(`Please enter ${k.replace("_", " ")}`);
        setLoading(false);
        return;
      }
    }

    // Prepare payload with clamped numeric values
    const payload = {
      rainfall: clamp(Number(form.rainfall), 0, 500),
      river_level: clamp(Number(form.river_level), 0, 50),
      soil_moisture: clamp(Number(form.soil_moisture), 0, 100),
      land_slope: clamp(Number(form.land_slope), 0, 90),
      population_density: clamp(Number(form.population_density), 0, 5000),
    };

    try {
      const res = await axios.post(API, payload, { timeout: 10000 });
      setResult(res.data);
    } catch (err) {
      console.error("AXIOS ERROR:", err);

      if (err.response) {
        console.error("STATUS:", err.response.status);
        console.error("RESPONSE DATA:", err.response.data);
        setError(
          `Prediction failed: ${err.response.status} - ${JSON.stringify(
            err.response.data
          )}`
        );
      } else if (err.request) {
        // no response received
        setError(
          "No response from server — check that the flood backend is running and CORS is configured."
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
      <h1>🌊 Flood Risk Prediction</h1>
      <p style={{ opacity: 0.6 }}>Powered by machine learning model</p>

      <div style={{ marginTop: 20 }}>
        <Field
          label="Rainfall (mm)"
          name="rainfall"
          min={0}
          max={500}
          value={form.rainfall}
          onChange={updateField}
        />
        <Field
          label="River Level (meters)"
          name="river_level"
          min={0}
          max={50}
          value={form.river_level}
          onChange={updateField}
        />
        <Field
          label="Soil Moisture (%)"
          name="soil_moisture"
          min={0}
          max={100}
          value={form.soil_moisture}
          onChange={updateField}
        />
        <Field
          label="Land Slope (degrees)"
          name="land_slope"
          min={0}
          max={90}
          value={form.land_slope}
          onChange={updateField}
        />
        <Field
          label="Population Density"
          name="population_density"
          min={0}
          max={5000}
          value={form.population_density}
          onChange={updateField}
        />

        <button
          onClick={predict}
          disabled={loading}
          style={{
            marginTop: 10,
            padding: "10px 15px",
            background: "#2563eb",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Predicting..." : "Predict"}
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
            padding: 15,
            background: "#0f172a",
            color: "white",
            borderRadius: 6,
          }}
        >
          <h3>Result</h3>
          <p>
            <strong>Risk Level:</strong> {result.risk_level}
          </p>
          <p>
            <strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%
          </p>
          <h4>Probability Breakdown:</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(result.probability_distribution, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}