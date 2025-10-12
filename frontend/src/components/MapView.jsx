import React, { useEffect, useRef, useState } from "react";

export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const heatLayer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    console.log("🗺️ Initializing map and scripts...");

    // Load Leaflet CSS
    const link = document.createElement("link");
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.async = true;

    script.onload = () => {
      console.log("✅ Leaflet JS loaded");

      // Load Leaflet.heat plugin
      const heatScript = document.createElement("script");
      heatScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js";
      heatScript.async = true;

      heatScript.onload = () => {
        console.log("🔥 Leaflet Heat plugin loaded");

        if (map.current) {
          console.warn("⚠️ Map already initialized, skipping...");
          return;
        }

        // Create map centered on India
        map.current = window.L.map(mapContainer.current).setView(
          [22.9734, 78.6569],
          5
        );
        console.log("🗺️ Map created, centered at [22.9734, 78.6569]");

        // Add OpenStreetMap tiles
        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }
        ).addTo(map.current);

        setMapLoaded(true);
        console.log("✅ Tile layer added");

        // Load and parse CSV data
        loadEarthquakeData();

        // Get user's current location
        if (navigator.geolocation) {
          console.log("📍 Attempting to get user location...");
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const accuracy = position.coords.accuracy;
              console.log(
                `✅ Got user location: [${lat}, ${lng}], accuracy: ${accuracy}m`
              );

              // Add marker at user's location
              window.L.marker([lat, lng], {
                icon: window.L.icon({
                  iconUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                  iconRetinaUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
                  shadowUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
                }),
              })
                .addTo(map.current)
                .bindPopup("<strong>Your Location</strong>");

              if (accuracy && accuracy > 0 && accuracy < 100000) {
                window.L.circle([lat, lng], {
                  radius: accuracy,
                  color: "#2563eb",
                  fillColor: "#60a5fa",
                  fillOpacity: 0.25,
                }).addTo(map.current);
              }
            },
            (error) => {
              console.error("❌ Geolocation error:", error);
            }
          );
        } else {
          console.warn("⚠️ Geolocation not supported");
        }
      };

      document.head.appendChild(heatScript);
    };

    document.head.appendChild(script);

    return () => {
      if (map.current) {
        console.log("🧹 Cleaning up map instance...");
        map.current.remove();
      }
    };
  }, []);

  const loadEarthquakeData = async () => {
    try {
      console.log("📂 Fetching CSV: /Indian_earthquake_data.csv");
      const response = await fetch("/Indian_earthquake_data.csv");
      if (!response.ok) {
        console.error(`❌ Failed to fetch CSV: ${response.status}`);
        return;
      }

      const csvText = await response.text();
      console.log("✅ CSV fetched successfully. First 200 chars:");
      console.log(csvText.slice(0, 200));

      // Parse CSV safely
      const lines = csvText
        .replace(/^\uFEFF/, "")
        .trim()
        .split(/\r?\n/);
      const headers = lines[0].split(",").map((h) => h.trim());
      console.log("🧩 Parsed headers:", headers);

      const latIndex = headers.indexOf("Latitude");
      const lngIndex = headers.indexOf("Longitude");
      const magIndex = headers.indexOf("Magnitude");
      const locIndex = headers.indexOf("Location");

      if (latIndex === -1 || lngIndex === -1 || magIndex === -1) {
        console.error("❌ Required columns not found in CSV!");
        return;
      }

      const earthquakeData = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const match = lines[i].match(
          /^([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),(.*)$/
        );
        if (!match) {
          console.warn(`⚠️ Skipping malformed line ${i + 1}:`, lines[i]);
          continue;
        }

        const lat = parseFloat(match[latIndex + 1]);
        const lng = parseFloat(match[lngIndex + 1]);
        const mag = parseFloat(match[magIndex + 1]);
        const location = match[locIndex + 1]?.replace(/^"|"$/g, "").trim();

        if (
          !isNaN(lat) &&
          !isNaN(lng) &&
          !isNaN(mag) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180 &&
          mag > 0
        ) {
          earthquakeData.push({ lat, lng, mag, location });
        } else {
          console.warn(
            `⚠️ Invalid coordinates or magnitude at line ${i + 1}:`,
            {
              lat,
              lng,
              mag,
              location,
            }
          );
        }
      }

      console.log(`📊 Total valid earthquakes: ${earthquakeData.length}`);
      console.table(earthquakeData.slice(0, 5));

      if (earthquakeData.length === 0) {
        console.error("❌ No valid earthquake data found");
        return;
      }

      // Create heatmap layer
      const heatPoints = earthquakeData.map((d) => [d.lat, d.lng, d.mag * 0.3]);
      console.log("🔥 Heatmap points sample:", heatPoints.slice(0, 5));

      if (window.L.heatLayer) {
        heatLayer.current = window.L.heatLayer(heatPoints, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          minOpacity: 0.4,
          gradient: {
            0.2: "#22c55e",
            0.4: "#facc15",
            0.6: "#f97316",
            0.8: "#ef4444",
          },
        }).addTo(map.current);
        console.log("✅ Heatmap layer added");
      } else {
        console.error("❌ Leaflet Heat plugin not loaded");
      }

      // Add markers for significant earthquakes
      earthquakeData.forEach((d) => {
        if (d.mag >= 4.0) {
          const color = d.mag >= 5.0 ? "#ef4444" : "#f97316";
          const radius = Math.min(d.mag * 2, 20);
          window.L.circleMarker([d.lat, d.lng], {
            radius,
            color,
            fillColor: color,
            fillOpacity: 0.6,
            weight: 2,
          }).addTo(map.current).bindPopup(`
            <div style="font-family: sans-serif; min-width: 200px;">
              <strong>${d.location}</strong><br/>
              <strong>Magnitude:</strong> ${d.mag}<br/>
              <strong>Coordinates:</strong> ${d.lat.toFixed(
                2
              )}, ${d.lng.toFixed(2)}
            </div>
          `);
        }
      });
      console.log("📍 Significant earthquake markers added");

      // Fit map to show all earthquakes
      const bounds = earthquakeData.map((d) => [d.lat, d.lng]);
      if (bounds.length > 0) {
        console.log("🧭 Fitting map to bounds...");
        setTimeout(() => {
          map.current.fitBounds(bounds, { padding: [50, 50] });
          console.log("✅ Map view adjusted to earthquake bounds");
        }, 500);
      }

      setDataLoaded(true);
      console.log("✅ Data loaded and visualized successfully");
    } catch (error) {
      console.error("💥 Error loading earthquake data:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-semibold">Earthquake Risk Heatmap</div>
        {dataLoaded && (
          <div className="text-sm text-green-600 font-medium">
            ✓ Data Loaded
          </div>
        )}
      </div>

      <div className="relative h-[500px] w-full rounded-xl overflow-hidden border border-gray-200">
        <div ref={mapContainer} className="w-full h-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-indigo-100 to-sky-50 text-gray-600">
            🗺️ Loading Map...
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-green-500" /> Low Risk
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-yellow-400" /> Moderate Risk
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-orange-500" /> High Risk
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-red-500" /> Critical Risk
        </div>
      </div>
    </div>
  );
}
