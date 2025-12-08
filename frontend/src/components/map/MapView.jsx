import React, { useEffect, useRef, useState } from "react";


export default function MapView() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const heatRef = useRef(null);
  const quakeLayerRef = useRef(null);
  const cycloneRef = useRef(null);
  const floodRef = useRef(null);
  const fireRef = useRef(null);

  const earthquakesRef = useRef([]);
  const cycloneRefData = useRef([]);
  const floodRefData = useRef([]);
  const fireRefData = useRef([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showQuakes, setShowQuakes] = useState(false);
  const [showCyclone, setShowCyclone] = useState(false);
  const [showFlood, setShowFlood] = useState(false);
  const [showFire, setShowFire] = useState(false);

  const [magThreshold, setMagThreshold] = useState(3.0);

  useEffect(() => {
    // add leaflet css
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    document.head.appendChild(cssLink);

    // load leaflet script
    const leafletScript = document.createElement("script");
    leafletScript.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    leafletScript.async = true;

    leafletScript.onload = () => {
      // load heat plugin next
      const heatScript = document.createElement("script");
      heatScript.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js";
      heatScript.async = true;

      heatScript.onload = () => {
        // initialize map once both are loaded
        initMap();
      };

      document.head.appendChild(heatScript);
    };

    document.head.appendChild(leafletScript);

    return () => {
      try {
        if (mapRef.current) mapRef.current.remove();
      } catch (e) {}
    };
  }, []);

  // Initialize the Leaflet map and prepare LayerGroups
  function initMap() {
    if (!window.L) {
      console.error("Leaflet not loaded");
      return;
    }
    if (mapRef.current) return;

    mapRef.current = window.L.map(mapContainerRef.current, {
      center: [22.9734, 78.6569],
      zoom: 5,
      minZoom: 3,
    });

    const street = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    });
    street.addTo(mapRef.current);

    const satellite = window.L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri & others", maxZoom: 19 }
    );

    // layer control
    window.L.control.layers({ Street: street, Satellite: satellite }).addTo(mapRef.current);

    // layer groups
    heatRef.current = null;
    quakeLayerRef.current = window.L.layerGroup();
    cycloneRef.current = window.L.layerGroup();
    floodRef.current = window.L.layerGroup();
    fireRef.current = window.L.layerGroup();

    setMapLoaded(true);

    // Load datasets 
    Promise.all([
      fetchCSV("/Indian_earthquake_data.csv"),
      fetchCSV("/cyclone_dataset.csv"),
      fetchCSV("/flood_risk_dataset_india.csv"),
      fetchCSV("/forestfires.csv"),
    ])
      .then(([eqRows, cyRows, flRows, ffRows]) => {
        earthquakesRef.current = parseEarthquakeCSV(eqRows);
        cycloneRefData.current = parseCycloneCSV(cyRows);
        floodRefData.current = parseLatLngCSV(flRows);
        fireRefData.current = parseForestFireCSV(ffRows);

        setDataLoaded(true);
      })
      .catch((err) => {
        console.warn("One or more datasets failed to load: ", err);
        setDataLoaded(true);
      });

    // Add geolocation marker if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          window.L.marker([lat, lng]).addTo(mapRef.current).bindPopup("<strong>Your Location</strong>");
        },
        () => {}
      );
    }
  }

  // Simple CSV fetch => returns raw CSV text lines array
  async function fetchCSV(path) {
    try {
      const r = await fetch(path);
      if (!r.ok) throw new Error("Not found: " + path);
      const text = await r.text();
      return text.split(/\r?\n/).filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  // Parse earthquake CSV robustly
  function parseEarthquakeCSV(lines) {
    if (!lines || lines.length === 0) return [];
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const latIdx = header.indexOf("latitude") >= 0 ? header.indexOf("latitude") : 0;
    const lngIdx = header.indexOf("longitude") >= 0 ? header.indexOf("longitude") : 1;
    const magIdx = header.indexOf("magnitude") >= 0 ? header.indexOf("magnitude") : 2;
    const locIdx = header.indexOf("location") >= 0 ? header.indexOf("location") : -1;

    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const row = splitCSVLine(lines[i]);
      const lat = parseFloatSafe(row[latIdx]);
      const lng = parseFloatSafe(row[lngIdx]);
      const mag = parseFloatSafe(row[magIdx]);
      const loc = locIdx >= 0 ? (row[locIdx] || "") : "";
      if (!isFinite(lat) || !isFinite(lng) || !isFinite(mag)) continue;
      out.push({ lat, lng, mag, loc });
    }
    return out;
  }

  // Parse cyclone CSV
  function parseCycloneCSV(lines) {
    if (!lines || lines.length === 0) return [];
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    let latIdx = header.findIndex((h) => h.includes("latitude") || h.includes("lat"));
    let lngIdx = header.findIndex((h) => h.includes("longitude") || h.includes("lon") || h.includes("lng"));
    if (latIdx === -1) latIdx = 0;
    if (lngIdx === -1) lngIdx = 1;

    const coords = [];
    for (let i = 1; i < lines.length; i++) {
      const row = splitCSVLine(lines[i]);
      const lat = parseFloatSafe(row[latIdx]);
      const lng = parseFloatSafe(row[lngIdx]);
      if (isFinite(lat) && isFinite(lng)) coords.push([lat, lng]);
    }
    return coords;
  }

  // generic lat/lng parse for flood dataset with STRICT filtering
  function parseLatLngCSV(lines) {
    if (!lines || lines.length === 0) return [];
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const latIdx = header.indexOf("latitude") >= 0 ? header.indexOf("latitude") : 0;
    const lngIdx = header.indexOf("longitude") >= 0 ? header.indexOf("longitude") : 1;
    
    // Look for "Flood Occurred" column - only show actual floods
    const floodOccurredIdx = header.findIndex(h => h.includes("flood") && h.includes("occurred"));
    
    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const row = splitCSVLine(lines[i]);
      const lat = parseFloatSafe(row[latIdx]);
      const lng = parseFloatSafe(row[lngIdx]);
      
      // Validate coordinates are within India bounds (approx)
      if (!isFinite(lat) || !isFinite(lng)) continue;
      if (lat < 8 || lat > 37 || lng < 68 || lng > 97) continue;
      
      // CRITICAL: Only show where actual floods occurred (value = 1)
      if (floodOccurredIdx >= 0) {
        const floodOccurred = row[floodOccurredIdx]?.trim();
        if (floodOccurred !== "1") continue; // Skip if no flood occurred
      }
      
      out.push({ lat, lng });
    }
    
    // Limit to max 200 points for clean visualization
    return out.length > 200 ? out.slice(0, 200) : out;
  }

  // parse forestfire csv with filtering
  function parseForestFireCSV(lines) {
    if (!lines || lines.length === 0) return [];
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const latIdx = header.indexOf("latitude") >= 0 ? header.indexOf("latitude") : header.indexOf("y") >= 0 ? header.indexOf("y") : 0;
    const lngIdx = header.indexOf("longitude") >= 0 ? header.indexOf("longitude") : header.indexOf("x") >= 0 ? header.indexOf("x") : 1;
    
    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const row = splitCSVLine(lines[i]);
      const lat = parseFloatSafe(row[latIdx]);
      const lng = parseFloatSafe(row[lngIdx]);
      
      // Validate coordinates are within India bounds
      if (!isFinite(lat) || !isFinite(lng)) continue;
      if (lat < 8 || lat > 37 || lng < 68 || lng > 97) continue;
      
      out.push({ lat, lng });
    }
    
    // Limit to max 300 points
    return out.length > 300 ? out.slice(0, 300) : out;
  }

  function splitCSVLine(line) {
    const parts = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' || ch === "'") {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        parts.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    parts.push(cur);
    return parts.map((p) => p.trim());
  }

  function parseFloatSafe(v) {
    const n = parseFloat(v);
    return isNaN(n) ? NaN : n;
  }

  // draw cyclone (polyline)
  function drawCyclone() {
    if (!mapRef.current) return;
    if (cycloneRef.current) cycloneRef.current.clearLayers();

    const coords = cycloneRefData.current.length ? cycloneRefData.current : [
      [19.5, 85.7],
      [18.2, 86.8],
      [17.4, 84.3],
    ];

    const poly = window.L.polyline(coords, {
      color: "orange",
      weight: 4,
      dashArray: "6 4",
      opacity: 0.9,
    });

    cycloneRef.current.addLayer(poly);
    if (showCyclone) cycloneRef.current.addTo(mapRef.current);
    else cycloneRef.current.remove();
  }

  // draw flood rectangles - larger, more visible
  function drawFlood() {
    if (!mapRef.current) return;
    floodRef.current.clearLayers();

    const sizeDeg = 0.15; // Larger size for better visibility
    const points = floodRefData.current || [];
    
    points.forEach((r, idx) => {
      const lat = r.lat;
      const lng = r.lng;
      if (!isFinite(lat) || !isFinite(lng)) return;
      
      const bounds = [
        [lat - sizeDeg, lng - sizeDeg],
        [lat + sizeDeg, lng + sizeDeg],
      ];
      const rect = window.L.rectangle(bounds, {
        color: "#3b82f6",
        weight: 2.5,
        fillColor: "#60a5fa",
        fillOpacity: 0.15,
        dashArray: "5 5",
      }).bindPopup(`<strong>Flood Zone ${idx + 1}</strong><br/>Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)}`);
      
      floodRef.current.addLayer(rect);
    });

    if (showFlood) floodRef.current.addTo(mapRef.current);
    else floodRef.current.remove();
  }

  // draw fire square rings - larger, more visible
  function drawFire() {
    if (!mapRef.current) return;
    fireRef.current.clearLayers();

    const sizeDeg = 0.15; // Larger size
    const points = fireRefData.current || [];
    
    points.forEach((r, idx) => {
      const lat = r.lat;
      const lng = r.lng;
      if (!isFinite(lat) || !isFinite(lng)) return;
      
      const bounds = [
        [lat - sizeDeg, lng - sizeDeg],
        [lat - sizeDeg, lng + sizeDeg],
        [lat + sizeDeg, lng + sizeDeg],
        [lat + sizeDeg, lng - sizeDeg],
      ];
      const poly = window.L.polygon(bounds, {
        color: "#f97316",
        weight: 2.5,
        fillColor: "#fb923c",
        fillOpacity: 0.15,
        dashArray: "6 4",
      }).bindPopup(`<strong>Forest Fire Zone ${idx + 1}</strong><br/>Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)}`);
      
      fireRef.current.addLayer(poly);
    });

    if (showFire) fireRef.current.addTo(mapRef.current);
    else fireRef.current.remove();
  }

  // draw quake circles & heatmap
  function drawEarthquakes() {
    if (!mapRef.current) return;

    quakeLayerRef.current.clearLayers();
    try {
      if (heatRef.current && heatRef.current.remove) {
        mapRef.current.removeLayer(heatRef.current);
        heatRef.current = null;
      }
    } catch (e) {}

    const data = earthquakesRef.current || [];
    if (data.length === 0) return;

    // Heatmap: only if enabled
    if (showHeatmap && window.L && window.L.heatLayer) {
      const points = data.map((d) => [d.lat, d.lng, Math.max(0.1, d.mag * 0.25)]);
      heatRef.current = window.L.heatLayer(points, {
        radius: 25,
        blur: 20,
        maxZoom: 11,
        minOpacity: 0.25,
        gradient: {
          0.2: "#dbeeff",
          0.4: "#94c9ff",
          0.6: "#57b0ff",
          0.8: "#1a8cff",
          1.0: "#005bb5",
        },
      }).addTo(mapRef.current);
    }

    // Earthquake circles: only if enabled
    if (showQuakes) {
      data.forEach((d) => {
        if (!isFinite(d.mag)) return;
        if (d.mag < magThreshold) return;
        const color = d.mag >= 6 ? "#ef4444" : d.mag >= 5 ? "#fb923c" : d.mag >= 4 ? "#f59e0b" : "#10b981";
        const radius = Math.min(20, 3 + d.mag * 2.5);
        const cm = window.L.circleMarker([d.lat, d.lng], {
          radius,
          color,
          weight: 1.4,
          fillOpacity: 0.55,
        }).bindPopup(
          `<div style="font-family: sans-serif; min-width:160px;"><strong>${d.loc || "Unknown"}</strong><br/>Magnitude: ${d.mag}<br/>Coords: ${d.lat.toFixed(
            3
          )}, ${d.lng.toFixed(3)}</div>`
        );
        quakeLayerRef.current.addLayer(cm);
      });
      quakeLayerRef.current.addTo(mapRef.current);
    } else {
      quakeLayerRef.current.remove();
    }
  }

  // Redraw layers when toggles change
  useEffect(() => {
    if (mapLoaded && dataLoaded) drawCyclone();
  }, [showCyclone, mapLoaded, dataLoaded]);

  useEffect(() => {
    if (mapLoaded && dataLoaded) drawFlood();
  }, [showFlood, mapLoaded, dataLoaded]);

  useEffect(() => {
    if (mapLoaded && dataLoaded) drawFire();
  }, [showFire, mapLoaded, dataLoaded]);

  useEffect(() => {
    if (mapLoaded && dataLoaded) drawEarthquakes();
  }, [showHeatmap, showQuakes, magThreshold, mapLoaded, dataLoaded]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-semibold">Earthquake &amp; Disaster Map</div>
        {dataLoaded && <div className="text-sm text-green-600 font-medium">✓ Data Loaded</div>}
      </div>

      <div className="flex gap-6">
        <div style={{ width: 360 }}>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Earthquake Markers</h3>
            <div className="text-sm text-gray-600 mb-3">
              <strong>Magnitude intensity:</strong> Low &lt; 4, Moderate 4–5, High 5–6, Critical &gt; 6
            </div>

            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" checked={showQuakes} onChange={() => setShowQuakes((s) => !s)} />
              <span>Earthquake Circles</span>
            </label>

            <div className="mb-2">
              <label className="block text-sm">Magnitude threshold (show circles for mag ≥)</label>
              <input
                type="range"
                min="0"
                max="8"
                step="0.1"
                value={magThreshold}
                onChange={(e) => setMagThreshold(parseFloat(e.target.value))}
              />
              <div className="text-xs text-gray-600">{magThreshold.toFixed(1)}</div>
            </div>

            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" checked={showHeatmap} onChange={() => setShowHeatmap((s) => !s)} />
              <span>Heatmap</span>
            </label>

            <hr className="my-3" />

            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" checked={showCyclone} onChange={() => setShowCyclone((s) => !s)} />
              <span>Cyclone Path</span>
            </label>
            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" checked={showFlood} onChange={() => setShowFlood((s) => !s)} />
              <span>Flood Zones</span>
            </label>
            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" checked={showFire} onChange={() => setShowFire((s) => !s)} />
              <span>Forest Fire Rings</span>
            </label>

            <p className="text-sm text-gray-500 mt-3">All layers are OFF by default. Toggle ON to view each disaster layer individually. Flood zones show only areas where floods actually occurred.</p>
          </div>

          <div className="p-4 rounded-lg border mt-4">
            <h4 className="font-semibold mb-2">Legend</h4>
            <div className="flex items-center gap-3 mb-2"><div style={{ width: 14, height: 14, background: '#10b981', borderRadius: 999 }} /> Low Risk</div>
            <div className="flex items-center gap-3 mb-2"><div style={{ width: 14, height: 14, background: '#f59e0b', borderRadius: 999 }} /> Moderate Risk</div>
            <div className="flex items-center gap-3 mb-2"><div style={{ width: 14, height: 14, background: '#fb923c', borderRadius: 999 }} /> High Risk</div>
            <div className="flex items-center gap-3 mb-2"><div style={{ width: 14, height: 14, background: '#ef4444', borderRadius: 999 }} /> Critical Risk</div>
            <div className="flex items-center gap-3 mb-2"><div style={{ width: 14, height: 14, background: '#fbbf24' }} /> Forest fire (square ring)</div>
            <div className="flex items-center gap-3 mb-2"><div style={{ width: 14, height: 14, background: '#60a5fa' }} /> Flood (rectangle ring)</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="relative h-[600px] w-full rounded-xl overflow-hidden border border-gray-200">
            <div ref={mapContainerRef} id="map" className="w-full h-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600">🗺️ Loading map...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}