import React, { useState } from "react";
import axios from "axios";

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

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const predict = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.post(API, {
        rainfall: Number(form.rainfall),
        river_level: Number(form.river_level),
        soil_moisture: Number(form.soil_moisture),
        land_slope: Number(form.land_slope),
        population_density: Number(form.population_density),
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("❌ Prediction failed — check values or backend log.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, min, max }) => (
    <label style={{ display: "block", marginBottom: "12px" }}>
      {label}{" "}
      <small style={{ opacity: 0.6 }}>
        ({min}–{max})
      </small>
      <input
        type="number"
        name={name}
        value={form[name]}
        onChange={updateField}
        min={min}
        max={max}
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

  return (
    <div style={{ padding: 20 }}>
      <h1>🌊 Flood Risk Prediction</h1>
      <p style={{ opacity: 0.6 }}>Powered by machine learning model</p>

      <div style={{ marginTop: 20 }}>
        <Field label="Rainfall (mm)" name="rainfall" min={0} max={500} />
        <Field
          label="River Level (meters)"
          name="river_level"
          min={0}
          max={50}
        />
        <Field
          label="Soil Moisture (%)"
          name="soil_moisture"
          min={0}
          max={100}
        />
        <Field
          label="Land Slope (degrees)"
          name="land_slope"
          min={0}
          max={90}
        />
        <Field
          label="Population Density"
          name="population_density"
          min={0}
          max={5000}
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
