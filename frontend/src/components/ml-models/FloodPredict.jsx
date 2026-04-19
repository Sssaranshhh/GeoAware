/**
 * FloodPredict Component - Wris Flood Model Integration
 * 
 * This component displays real-time flood risk predictions for 85 Indian districts
 * using the Wris Flood Model FastAPI service.
 * 
 * Key features:
 * - Interactive Leaflet map showing district locations with color-coded risk levels
 * - Real-time predictions from Wris API: http://localhost:8000/predict
 * - Auto-refresh predictions every 30 seconds for selected district
 * - Transparency layers: data quality, raw ML output, validation details, and AI insights
 * - Shows error state if API is unavailable (no mock data fallback)
 * 
 * Request structure: { latitude, longitude, date, stateName, districtName }
 * Response structure: { risk_level, confidence, risk_score, raw_data, data_quality, ai_insights, ... }
 * 
 * Environment variables:
 * - VITE_WRIS_URL: Wris service URL (default: http://localhost:8000)
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { predictFloodRisk } from "../../services/wrisApi";
import { districts } from "./districts";
import {
  CloudRain,
  Droplets,
  Waves,
  ThermometerSun,
  Wind,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  RefreshCw,
  Info
} from "lucide-react";

export default function FloodPredict() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  const [selectedDate, setSelectedDate] = useState("2026-03-15");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [autoRefreshCounter, setAutoRefreshCounter] = useState(0);
  const [apiError, setApiError] = useState(false);

  // Clear all cached data on component mount to ensure fresh data
  useEffect(() => {
    setData(null);
    setApiError(false);
    sessionStorage.clear();
  }, []);

  // Auto refresh timer
  useEffect(() => {
    let timer;
    if (selectedDistrict) {
      timer = setInterval(() => {
        setAutoRefreshCounter((prev) => {
          if (prev >= 30) {
            fetchPrediction(selectedDistrict, selectedDate, true);
            return 0;
          }
          return prev + 1;
        });
        setLastUpdated((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedDistrict, selectedDate]);

  // Load Leaflet dynamically
  useEffect(() => {
    if (!window.L) {
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(cssLink);

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const fetchPrediction = async (district, date, isAuto = false) => {
    if (!isAuto) {
      setLoading(true);
      setData(null); // Clear previous data to avoid showing stale mock data
      setApiError(false);
    }
    
    // Pulse animation logic
    if (markersRef.current[district.id]) {
      const el = markersRef.current[district.id].getElement();
      if (el) el.style.animation = "pulseMarker 1s ease-out";
      setTimeout(() => {
        if (el) el.style.animation = "";
      }, 1000);
    }

    try {
      // Connecting to Wris Flood Model API via service
      console.log(`[FloodPredict] Fetching prediction for ${district.name}, ${district.state}`);
      const response = await predictFloodRisk({
        latitude: district.lat,
        longitude: district.lng,
        date: date,
        stateName: district.state || "Unknown",
        districtName: district.name,
      });
      console.log(`[FloodPredict] API Response for ${district.name}:`, response);
      setData(response);
      setApiError(false);
      updateMarkerColor(district.id, response.risk_level);
    } catch (err) {
      console.error(`[FloodPredict] API Error for ${district.name}:`, err.message);
      setApiError(true);
      // Only show mock data if this is auto-refresh, otherwise show error
      if (isAuto) {
        console.warn("Auto-refresh failed, keeping previous data");
      } else {
        // Show error state instead of mock data
        setData(null);
      }
    } finally {
      if (!isAuto) setLoading(false);
      setLastUpdated(0);
      setAutoRefreshCounter(0);
    }
  };

  const getMarkerColor = (riskLevel) => {
    if (!riskLevel) return "#3b82f6"; // Default Blue
    if (riskLevel.toLowerCase() === "high") return "#ef4444"; // Red
    if (riskLevel.toLowerCase() === "moderate") return "#f59e0b"; // Yellow
    if (riskLevel.toLowerCase() === "low") return "#10b981"; // Green
    return "#3b82f6";
  };

  const updateMarkerColor = (id, riskLevel) => {
    if (markersRef.current[id]) {
      const color = getMarkerColor(riskLevel);
      const marker = markersRef.current[id];
      marker.setStyle({ fillColor: color, color: color });
    }
  };

  const initMap = () => {
    if (mapRef.current) return;
    mapRef.current = window.L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      minZoom: 4,
    });

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapRef.current);

    // Initial blue circle markers for 85 districts
    districts.forEach(d => {
      const marker = window.L.circleMarker([d.lat, d.lng], {
        radius: 6,
        fillColor: "#3b82f6",
        color: "#2563eb",
        weight: 1.5,
        fillOpacity: 0.8,
      });

      marker.bindTooltip(`<b>${d.name}</b><br/>${d.state}`, { direction: "top", offset: [0, -10], className: 'custom-tooltip' });
      marker.on("click", () => {
        setSelectedDistrict(d);
        fetchPrediction(d, selectedDate);
        mapRef.current.flyTo([d.lat, d.lng], 7, { animate: true, duration: 1 });
      });

      marker.addTo(mapRef.current);
      markersRef.current[d.id] = marker;
    });
  };

  // Trigger when Date changes and we have a selected district
  useEffect(() => {
    if (selectedDistrict) {
      fetchPrediction(selectedDistrict, selectedDate);
    }
  }, [selectedDate]);

  // Force refresh - clears all data and refetches
  const handleForceRefresh = () => {
    setData(null);
    setApiError(false);
    if (selectedDistrict) {
      fetchPrediction(selectedDistrict, selectedDate);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <style>{`
        @keyframes pulseMarker {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { transform: scale(1.5); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .custom-tooltip {
          background: rgba(15, 23, 42, 0.9) !important;
          border: 1px solid rgba(59, 130, 246, 0.3) !important;
          color: white !important;
          border-radius: 8px !important;
          padding: 6px 12px !important;
        }
        .custom-tooltip.leaflet-tooltip-top:before { border-top-color: rgba(15, 23, 42, 0.9) !important; }
        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-left: 1px solid rgba(255, 255, 255, 0.05);
        }
        .stat-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 4px 20px -2px rgba(0,0,0,0.4);
        }
      `}</style>

      {/* LEFT PANE - MAP UI */}
      <div className="flex-1 relative">
        {/* Top Controls Float */}
        <div className="absolute top-6 left-6 right-6 z-[1000] flex justify-between items-center pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Waves size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">GeoAware Auto-Sim</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">85 Districts Real-Time Model</p>
            </div>
          </div>

          <div className="flex gap-4 pointer-events-auto">
            <div className="bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 shadow-lg flex items-center gap-3">
              <Calendar size={18} className="text-blue-400"/>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 text-white outline-none"
              />
            </div>
            <button
              onClick={handleForceRefresh}
              disabled={!selectedDistrict || loading}
              className="bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 shadow-lg hover:bg-slate-800/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              title="Force refresh - clears cache and refetches data"
            >
              <RefreshCw size={18} className="text-emerald-400"/>
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* The Map */}
        <div ref={mapContainerRef} className="w-full h-full z-0" style={{ background: '#090d16' }}></div>
        
        {/* Bottom Legend */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/80 backdrop-blur-md px-5 py-4 rounded-xl border border-white/10 shadow-xl pointer-events-auto">
          <h3 className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">Risk Legend</h3>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 text-sm font-medium"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span> High Risk</div>
            <div className="flex items-center gap-3 text-sm font-medium"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span> Moderate</div>
            <div className="flex items-center gap-3 text-sm font-medium"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> Low Risk</div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Unscanned</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE - DASHBOARD */}
      <div className="w-[420px] h-full flex-shrink-0 glass-panel flex flex-col relative z-20">
        
        {!selectedDistrict ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-60">
            <div className="w-20 h-20 rounded-full border border-dashed border-slate-500 flex items-center justify-center mb-6">
              <Activity className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Awaiting Selection</h3>
            <p className="text-sm text-slate-400">Click on any district marker on the map to run the real-time simulation model for {selectedDate}.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar">
            
            {/* Real-time Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{selectedDistrict.name}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                  {selectedDistrict.state}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">ID: {selectedDistrict.id}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Output
                </div>
                <p className="text-[10px] text-slate-500 whitespace-nowrap">Updated: {lastUpdated}s ago · Auto in {30 - autoRefreshCounter}s</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw size={36} className="text-blue-500 animate-spin mb-4" />
                <p className="text-sm font-medium bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">Fetching live data models...</p>
                <p className="text-xs text-slate-500 mt-2 text-center">This may take up to 60 seconds as we fetch data from WRIS, Open-Meteo, and generate AI insights</p>
              </div>
            ) : apiError && !data ? (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertTriangle size={36} className="text-red-500 mb-4" />
                <p className="text-sm font-medium text-red-400 mb-2">API Connection Error</p>
                <p className="text-xs text-slate-400 text-center">Unable to connect to Wris service. Ensure the backend is running at:</p>
                <p className="text-xs text-slate-500 font-mono mt-1">http://localhost:8000</p>
                <button 
                  onClick={() => fetchPrediction(selectedDistrict, selectedDate)}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : data && (
              <div className="space-y-6 pb-10">
                
                {/* SECTION 1: OVERVIEW CARD */}
                <div className="stat-card rounded-2xl p-5 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-40 rounded-full -mr-10 -mt-10 transition-colors duration-1000 ${
                    data.risk_level === 'High' ? 'bg-red-500' : data.risk_level === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>
                  
                  <div className="relative z-10 flex justify-between items-end">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">Condition Status</p>
                      <h1 className={`text-4xl font-extrabold tracking-tight ${
                        data.risk_level === 'High' ? 'text-red-400' : data.risk_level === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {data.risk_level} Risk
                      </h1>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-slate-400 mb-0.5">Risk Score</p>
                      <p className="text-2xl font-bold font-mono">{(data.risk_score * 100).toFixed(1)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                       <CheckCircle size={16} className="text-blue-400"/>
                       <span className="text-slate-300">Model Confidence</span>
                    </div>
                    <span className="font-mono font-medium text-white px-2 py-1 bg-white/10 rounded-md">{(data.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* SECTION 2: KEY FACTORS GRIDS */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 flex items-center gap-2">
                    <Activity size={14}/> Key Environmental Factors
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col">
                      <div className="text-blue-400 mb-2"><CloudRain size={20} /></div>
                      <span className="text-xs text-slate-400 mb-1">Rainfall</span>
                      <span className="text-lg font-bold">{data.raw_data.rainfall_mm} <span className="text-xs font-normal opacity-50">mm</span></span>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col">
                      <div className="text-cyan-400 mb-2"><Droplets size={20} /></div>
                      <span className="text-xs text-slate-400 mb-1">Humidity</span>
                      <span className="text-lg font-bold">{data.raw_data.humidity_pct} <span className="text-xs font-normal opacity-50">%</span></span>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col">
                      <div className="text-indigo-400 mb-2"><Waves size={20} /></div>
                      <span className="text-xs text-slate-400 mb-1">River Discharge</span>
                      <span className="text-lg font-bold">{data.raw_data.river_discharge_m3_s} <span className="text-xs font-normal opacity-50">m³/s</span></span>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col">
                      <div className="text-orange-400 mb-2"><ThermometerSun size={20} /></div>
                      <span className="text-xs text-slate-400 mb-1">Water Level</span>
                      <span className="text-lg font-bold">{data.raw_data.water_level_m} <span className="text-xs font-normal opacity-50">cm</span></span>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: AI INSIGHTS */}
                {data?.ai_insights ? (
                  <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-1">
                    <div className="bg-slate-900/80 rounded-[10px] p-4 relative overflow-hidden">
                       {/* Decorative Groq badge */}
                       <div className="absolute top-0 right-0 bg-indigo-600 border-b border-l border-indigo-400/50 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-bl-lg text-indigo-50">
                          {data.ai_insights?.generated_by || "AI"} {data.ai_insights?.fallback ? "(Fallback)" : ""}
                       </div>
                       
                       <h3 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                          <Info size={16} /> {data.ai_insights?.fallback ? "Rule-Based" : "AI-Generated"} Analysis
                       </h3>
                       <p className="text-sm text-slate-300 leading-relaxed mb-4">
                          {data.ai_insights?.explanation || "Analysis unavailable"}
                       </p>
                       
                       <div className="bg-red-500/10 border-l-2 border-red-500 rounded-r-md p-3">
                          <p className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1.5"><AlertTriangle size={14}/> Recommendation</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{data.ai_insights?.action_advice || "No action advice available"}</p>
                       </div>
                       
                       {data.ai_insights?.severity_note && (
                          <div className="mt-3 p-2 bg-yellow-500/10 border-l-2 border-yellow-500 rounded-r-md">
                             <p className="text-xs text-yellow-300">{data.ai_insights.severity_note}</p>
                          </div>
                       )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400">AI insights unavailable</p>
                  </div>
                )}

                {/* SECTION 4: DATA QUALITY */}
                <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-orange-500/10 border border-orange-500/10 text-orange-200/80">
                  <span className="flex items-center gap-2">
                    <Activity size={14} className="text-orange-400"/> Data Match: {data.data_quality.completeness_pct}%
                  </span>
                  <span>{data.data_quality.fallback_count} values extrapolated</span>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
}