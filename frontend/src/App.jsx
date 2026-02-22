import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppContext } from "./Context/AppContext";

// Pages
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import MapPage from "./pages/MapPage";
import AlertPage from "./pages/AlertPage";
import VerifyPage from "./pages/VerifyPage";
import BroadcastPage from "./pages/BroadcastPage";
import SafetyPage from "./pages/SafetyPage";
import MLplugin from "./components/ml-models/ML-plugin";
import AirQuality from "./components/ml-models/AirQuality";
import FloodRouteNavigator from "./components/ml-models/FloodRouteNavigator";
import FloodPredict from "./components/ml-models/FloodPredict";

// Layout wrapper for authenticated pages
import AppLayout from "./components/common/AppLayout";
import Inbox from "./pages/Inbox";

const App = () => {
  const { isLoggedIn, role, loading } = useAppContext();
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState(null);
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");
  useEffect(() => {
      const WS = new WebSocket("ws://localhost:3000");
      console.log(userId, userType)
      setWs(WS)
      // wsRef.current = ws
      WS.onopen = () => {
        WS.send(JSON.stringify({
          type: "Register",
          userId: userId,
          userType: userType,
        })
      )}
      WS.onmessage = (event) =>{
        const receivedMessage = JSON.parse(event.data)
        console.log("Received Message", receivedMessage)
        setMessage(receivedMessage);

        console.log("incomingg role", receivedMessage.to)
      }
      return () => WS.close();
  }, [])

  // Show loading spinner while checking authentication
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

  // Redirect to auth if not logged in
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
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage message={filteredMessage} />} />
          <Route path="map" element={<MapPage />} />
          <Route path="safety" element={<SafetyPage />} />
          <Route path="predict" element={<MLplugin/>}/>
          <Route path="air-quality" element={<AirQuality/>}/>
          <Route path="flood-routing" element={<FloodRouteNavigator/>}/>
          <Route path="flood-prediction" element={<FloodPredict/>}/>
          <Route path="inbox" element={<Inbox message={filteredMessage}/>}/>
          

          {/* User-specific routes */}
          {role === "user" && (
            <Route path="alert" element={<AlertPage ws={ws} />} />
          )}

          {/* Responder-specific routes */}
          {role === "responder" && (
            <Route path="verify" element={<VerifyPage ws={ws} />} />
          )}

          {/* Admin-specific routes */}
          {role === "admin" && (
            <Route path="broadcast" element={<BroadcastPage ws={ws} />} />
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;