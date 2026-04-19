/**
 * Wris Flood Model API Service
 * 
 * This service connects the frontend to the Wris Flood Model FastAPI backend.
 * The Wris model provides real-time flood risk predictions for Indian districts
 * with advanced data quality metrics and AI-generated insights.
 * 
 * SETUP & STARTUP:
 * ================
 * 1. Frontend (.env):
 *    - VITE_API_URL=http://localhost:3000 (Express backend)
 *    - VITE_WRIS_URL=http://localhost:8000 (Wris FastAPI)
 * 
 * 2. Start Wris service:
 *    cd Wris_flood_model
 *    pip install -r requirements.txt
 *    python run.py
 *    (runs on http://localhost:8000 by default)
 * 
 * 3. Start Frontend:
 *    npm run dev
 *    Navigate to /flood-prediction route
 * 
 * API ENDPOINTS:
 * ==============
 * - POST /predict         : Single location prediction
 * - POST /predict/batch   : Batch predictions (up to 20 locations)
 * - GET  /health          : Service health check
 * - GET  /docs            : Swagger documentation
 * 
 * RESPONSE STRUCTURE:
 * ===================
 * {
 *   risk_level: "High" | "Moderate" | "Low",
 *   confidence: 0-1,
 *   risk_score: 0-1,
 *   class_probabilities: { High: x, Moderate: y, Low: z },
 *   raw_data: { rainfall_mm, temperature_c, humidity_pct, ... },
 *   data_quality: { total_fields, realtime_count, fallback_count, ... },
 *   raw_ml_output: { ... },
 *   validation: { ... },
 *   ai_insights: { explanation, action_advice, severity_note, ... }
 * }
 */

import axios from "axios";

// Separate instance for ML/Wris API (no JWT required)
const WRIS_URL = import.meta.env.VITE_WRIS_URL || "http://localhost:8000";

const wrisApi = axios.create({
  baseURL: WRIS_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
  timeout: 90000, // 90 second timeout for Wris predictions (data fetching can take time)
});

// Response interceptor for better error handling
wrisApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Wris API timeout: Request took longer than 15 seconds");
    } else if (error.code === "ERR_NETWORK") {
      console.error("Wris API network error: Cannot reach Wris service at", WRIS_URL);
    }
    return Promise.reject(error);
  }
);

/**
 * Predict flood risk for a single location using Wris model
 * @param {Object} params - Request parameters
 * @param {number} params.latitude - Latitude (-90 to 90)
 * @param {number} params.longitude - Longitude (-180 to 180)
 * @param {string} params.date - Date in YYYY-MM-DD format
 * @param {string} params.stateName - State name (e.g., "Assam")
 * @param {string} params.districtName - District name (e.g., "Dhubri")
 * @returns {Promise<Object>} Prediction response with risk_level, confidence, and transparency layers
 */
export const predictFloodRisk = async (params) => {
  try {
    console.log(`[wrisApi] Calling ${WRIS_URL}/predict with:`, params);
    const response = await wrisApi.post("/predict", {
      latitude: params.latitude,
      longitude: params.longitude,
      date: params.date,
      stateName: params.stateName,
      districtName: params.districtName,
    }, {
      params: { _cache_bust: Date.now() } // Prevent any caching
    });
    console.log(`[wrisApi] Response received:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[wrisApi] Error calling /predict:`, error);
    console.error(`[wrisApi] Wris service URL: ${WRIS_URL}`);
    console.error(`[wrisApi] Error details:`, {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

/**
 * Predict flood risk for multiple locations in parallel
 * @param {Array<Object>} locations - Array of location objects (max 20)
 * @returns {Promise<Object>} Batch prediction response
 */
export const predictFloodRiskBatch = async (locations) => {
  if (locations.length > 20) {
    throw new Error("Batch limit is 20 locations");
  }
  try {
    const response = await wrisApi.post("/predict/batch", {
      locations: locations.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        date: loc.date,
        stateName: loc.stateName,
        districtName: loc.districtName,
      })),
    });
    return response.data;
  } catch (error) {
    console.error("Wris batch prediction error:", error);
    throw error;
  }
};

/**
 * Check Wris service health and model status
 * @returns {Promise<Object>} Health status and model loading info
 */
export const checkWrisHealth = async () => {
  try {
    console.log(`[wrisApi] Checking health at ${WRIS_URL}/health`);
    const response = await wrisApi.get("/health");
    console.log(`[wrisApi] Health check passed:`, response.data);
    return { status: "ok", ...response.data };
  } catch (error) {
    console.error(`[wrisApi] Health check failed at ${WRIS_URL}/health:`, error);
    return { 
      status: "error", 
      message: error.message,
      code: error.code,
      url: WRIS_URL 
    };
  }
};

export default wrisApi;
