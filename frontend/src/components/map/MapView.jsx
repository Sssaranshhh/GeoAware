import React, { useEffect, useRef, useState } from "react";

const MapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const heatLayer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    const linkElement = document.createElement("link");
    linkElement.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    linkElement.rel = "stylesheet";
    document.head.appendChild(linkElement);

    // Load Leaflet JS
    const leafletScript = document.createElement("script");
    leafletScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    leafletScript.async = true;

    leafletScript.onload = () => {
      // Load Leaflet Heat plugin
      const heatScript = document.createElement("script");
      heatScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js";
      heatScript.async = true;

      heatScript.onload = () => {
        if (map.current) return;

        // Initialize map centered on India
        map.current = window.L.map(mapContainer.current).setView(
          [22.9734, 78.6569],
          5
        );

        // Add OpenStreetMap tiles
        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }
        ).addTo(map.current);

        setMapLoaded(true);

        // Load earthquake data
        loadEarthquakeData();

        // Get user's location
        getUserLocation();
      };

      document.head.appendChild(heatScript);
    };

    document.head.appendChild(leafletScript);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;

        // 🧭 User location marker with custom icon + popup
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

        // 🔵 Accuracy circle around user
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
        console.error("Geolocation error:", error);
      }
    );
  };

  const loadEarthquakeData = async () => {
    try {
      const response = await fetch("/Indian_earthquake_data.csv");
      if (!response.ok) return;

      const csvText = await response.text();
      const earthquakeData = parseEarthquakeCSV(csvText);

      if (earthquakeData.length === 0) return;

      // 🌡 Heatmap points
      const heatPoints = earthquakeData.map((d) => [d.lat, d.lng, d.mag * 0.3]);

      if (window.L.heatLayer) {
        heatLayer.current = window.L.heatLayer(heatPoints, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          minOpacity: 0.4,
          gradient: {
            0.2: "#22c55e", // green
            0.4: "#eab308", // yellow
            0.6: "#f97316", // orange
            0.8: "#dc2626", // red
          },
        }).addTo(map.current);
      }

      // 🔴 Earthquake circle markers with popups (RESTORED)
      earthquakeData.forEach((quake) => {
        if (quake.mag >= 4.0) {
          const color = quake.mag >= 5.0 ? "#ef4444" : "#f97316"; // red / orange
          const radius = Math.min(quake.mag * 2, 20);

          window.L.circleMarker([quake.lat, quake.lng], {
            radius,
            color,
            fillColor: color,
            fillOpacity: 0.6,
            weight: 2,
          }).addTo(map.current).bindPopup(`
              <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-width: 200px;">
                <strong>${quake.location || "Unknown Location"}</strong><br/>
                <strong>Magnitude:</strong> ${quake.mag}<br/>
                <strong>Coordinates:</strong> ${quake.lat.toFixed(
                  2
                )}, ${quake.lng.toFixed(2)}
              </div>
            `);
        }
      });

      // Fit map to show all earthquakes
      const bounds = earthquakeData.map((d) => [d.lat, d.lng]);
      if (bounds.length > 0) {
        setTimeout(() => {
          map.current.fitBounds(bounds, { padding: [80, 80] });
        }, 500);
      }

      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading earthquake data:", error);
    }
  };

  const parseEarthquakeCSV = (csvText) => {
    // handle BOM, trim, and split
    const lines = csvText
      .replace(/^\uFEFF/, "")
      .trim()
      .split(/\r?\n/);
    const headers = lines[0].split(",").map((h) => h.trim());

    const latIndex = headers.indexOf("Latitude");
    const lngIndex = headers.indexOf("Longitude");
    const magIndex = headers.indexOf("Magnitude");
    const locIndex = headers.indexOf("Location");

    if (latIndex === -1 || lngIndex === -1 || magIndex === -1) return [];

    const earthquakes = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      // more robust CSV row handling
      const match = lines[i].match(
        /^([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),(.*)$/
      );
      if (!match) continue;

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
        earthquakes.push({ lat, lng, mag, location });
      }
    }

    return earthquakes;
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Earthquake Risk Heatmap
        </h2>
        {dataLoaded && (
          <span className="text-sm font-medium text-emerald-600">
            ● Live Data Active
          </span>
        )}
      </div>

      {/* Map Container */}
      <div className="relative h-[500px] w-full rounded-xl overflow-hidden border border-slate-200">
        <div ref={mapContainer} className="w-full h-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 backdrop-blur-sm bg-white/60 flex items-center justify-center text-slate-600 font-medium">
            🗺️ Loading interactive map...
          </div>
        )}
      </div>

      {/* Risk Legend */}
      <div className="flex items-center gap-4 flex-wrap pt-1">
        {[
          { label: "Low Risk", color: "bg-green-500" },
          { label: "Moderate Risk", color: "bg-yellow-400" },
          { label: "High Risk", color: "bg-orange-500" },
          { label: "Critical Risk", color: "bg-red-600" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span className="text-xs text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;
