import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppContext } from "./Context/AppContext";

// Pages
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import MapPage from "./pages/MapPage";
import AlertPage from "./pages/AlertPage";
import VerifyPage from "./pages/VerifyPage";
import FieldReportPage from "./pages/FieldReportPage";
import BroadcastPage from "./pages/BroadcastPage";
import SafetyPage from "./pages/SafetyPage";
import MissingPersonPage from "./pages/MissingPersonPage";
import MLplugin from "./components/ml-models/ML-plugin";
import AirQuality from "./components/ml-models/AirQuality";
import FloodRouteNavigator from "./components/ml-models/FloodRouteNavigator";
import FloodPredict from "./components/ml-models/FloodPredict";
import MosdacPredict from "./components/ml-models/MosdacPredict";
import SimpleFloodPredict from "./components/ml-models/SimpleFloodPredict";

// Layout wrapper for authenticated pages
import AppLayout from "./components/common/AppLayout";
import Inbox from "./pages/Inbox";

const App = () => {
  const { isLoggedIn, role, loading, userId, mapRoleToUserType } = useAppContext();
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const userType = mapRoleToUserType(role);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    const root = document.documentElement;

    if (darkMode) {
      root.style.setProperty("--bg-primary", "#191919");
      root.style.setProperty("--bg-secondary", "#202020");
      root.style.setProperty("--bg-tertiary", "#2a2a2a");
      root.style.setProperty("--text-primary", "#ededed");
      root.style.setProperty("--text-secondary", "#b3b3b3");
      root.style.setProperty("--text-tertiary", "#8a8a8a");
      root.style.setProperty("--border-color", "#2f2f2f");
      root.style.setProperty("--border-light", "#2a2a2a");
      root.style.setProperty("--accent-blue", "#3b82f6");
      root.style.setProperty("--accent-hover", "#2563eb");
      root.style.setProperty("--accent-bg", "rgba(59,130,246,0.15)");
      root.style.setProperty("--status-danger", "#ef4444");
      root.style.setProperty("--status-warning", "#f97316");
      root.style.setProperty("--status-success", "#22c55e");
      root.style.setProperty("--transition", "all 0.2s ease");

      document.documentElement.style.backgroundColor = "#191919";
      document.documentElement.style.color = "#ededed";
      document.body.style.backgroundColor = "#191919";
      document.body.style.color = "#ededed";

      let darkModeStyle = document.getElementById("dark-mode-style");
      if (!darkModeStyle) {
        darkModeStyle = document.createElement("style");
        darkModeStyle.id = "dark-mode-style";
        document.head.appendChild(darkModeStyle);
      }

      darkModeStyle.textContent = `
        * {
          --bg-primary: #191919;
          --bg-secondary: #202020;
          --bg-tertiary: #2a2a2a;
          --text-primary: #ededed;
          --text-secondary: #b3b3b3;
          --text-tertiary: #8a8a8a;
          --accent-blue: #3b82f6;
          --accent-hover: #2563eb;
          --accent-bg: rgba(59,130,246,0.15);
          --border-color: #2f2f2f;
          --border-light: #2a2a2a;
          --status-danger: #ef4444;
          --status-warning: #f97316;
          --status-success: #22c55e;
          --transition: all 0.2s ease;
        }
        body, html, #root {
          background-color: #191919;
          color: #ededed;
        }
        input, textarea, select {
          background-color: #202020;
          color: #ededed;
          border: 1px solid #2f2f2f;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        input:focus, textarea:focus, select:focus {
          background-color: #2a2a2a;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        input::placeholder { color: #8a8a8a; }
        label, span { color: #ededed; }
        button { transition: all 0.2s ease; }
        button:hover:not(:disabled) { transform: translateY(-1px); }
        a { color: #3b82f6; transition: all 0.2s ease; }
        a:hover { color: #60a5fa; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #191919; }
        ::-webkit-scrollbar-thumb { background: #2f2f2f; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
      `;
    } else {
      root.style.setProperty("--bg-primary", "#ffffff");
      root.style.setProperty("--bg-secondary", "#f8f8f8");
      root.style.setProperty("--bg-tertiary", "#f0f0f0");
      root.style.setProperty("--bg-hover", "#efefef");
      root.style.setProperty("--text-primary", "#000000");
      root.style.setProperty("--text-secondary", "#666666");
      root.style.setProperty("--text-tertiary", "#999999");
      root.style.setProperty("--accent-blue", "#3b82f6");
      root.style.setProperty("--accent-blue-light", "#60a5fa");
      root.style.setProperty("--border-color", "#e5e5e5");
      root.style.setProperty("--border-light", "#f0f0f0");
      root.style.setProperty("--status-danger", "#ef4444");
      root.style.setProperty("--status-warning", "#f97316");
      root.style.setProperty("--status-success", "#22c55e");
      root.style.setProperty("--transition", "all 0.2s ease");

      document.documentElement.style.backgroundColor = "#ffffff";
      document.documentElement.style.color = "#000000";
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";

      const darkModeStyle = document.getElementById("dark-mode-style");
      if (darkModeStyle) darkModeStyle.remove();
    }
  }, [darkMode]);

  useEffect(() => {
    // Don't connect until we have a real userId (i.e. user is logged in)
    if (!userId) {
      setWs(null);
      return;
    }

    const WS = new WebSocket(import.meta.env.VITE_WS_URL);
    console.log("WS connecting for user:", userId, userType);
    setWs(WS);
    WS.onopen = () => {
      WS.send(JSON.stringify({
        type: "Register",
        userId: userId,
        userType: userType,
      }));
    };
    WS.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      console.log("Received Message", receivedMessage);
      setMessage(receivedMessage);
      if (receivedMessage.to) console.log("incoming role", receivedMessage.to);
    };
    return () => WS.close();
  }, [userId, userType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌍</div>
          <div className="text-2xl font-bold text-slate-700">
            Loading GeoAware...
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    );
  }

  const filteredMessage = message && message.to && message.to == userType.toLowerCase() ? message : null;

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-slate-900 text-gray-100" : "bg-slate-50 text-gray-900"
        }`}
      style={{
        backgroundColor: darkMode ? "#191919" : "#ffffff",
        color: darkMode ? "#ededed" : "#000000",
      }}
    >
      <Routes>
        <Route path="/" element={<AppLayout darkMode={darkMode} setDarkMode={setDarkMode} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage darkMode={darkMode} message={filteredMessage} />} />
          <Route path="map" element={<MapPage darkMode={darkMode} />} />
          <Route path="safety" element={<SafetyPage darkMode={darkMode} />} />
          <Route path="predict" element={<MLplugin darkMode={darkMode} />} />
          <Route path="air-quality" element={<AirQuality darkMode={darkMode} />} />
          <Route path="flood-routing" element={<FloodRouteNavigator darkMode={darkMode} />} />
          <Route path="flood-prediction" element={<FloodPredict darkMode={darkMode} />} />
          <Route path="simple-flood-prediction" element={<SimpleFloodPredict />} />
          <Route path="mosdac-prediction" element={<MosdacPredict darkMode={darkMode} />} />
          <Route path="inbox" element={<Inbox message={filteredMessage} darkMode={darkMode} onSelectMessage={setSelectedAlert} selectedAlert={selectedAlert} />} />
          <Route path="missing" element={<MissingPersonPage darkMode={darkMode} />} />

          {/* User-specific routes */}
          {role === "user" && (
            <Route path="alert" element={<AlertPage ws={ws} darkMode={darkMode} />} />
          )}

          {/* Responder-specific routes */}
          {role === "responder" && (
            <>
              <Route path="verify" element={<VerifyPage ws={ws} message={selectedAlert || filteredMessage} darkMode={darkMode} />} />
              <Route path="field-report" element={<FieldReportPage darkMode={darkMode} />} />
            </>
          )}

          {/* Admin-specific routes */}
          {role === "admin" && (
            <Route path="broadcast" element={<BroadcastPage ws={ws} message={selectedAlert || filteredMessage} darkMode={darkMode} />} />
          )}

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;