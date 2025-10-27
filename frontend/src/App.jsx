import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppContext } from "./Context/AppContext";

// Pages
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import MapPage from "./pages/MapPage";
import AlertPage from "./pages/AlertPage";
import VerifyPage from "./pages/VerifyPage";
import BroadcastPage from "./pages/BroadcastPage";

// Layout wrapper for authenticated pages
import AppLayout from "./components/common/AppLayout";

const App = () => {
  const { isLoggedIn, role, loading } = useAppContext();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🌍</div>
          <div className="text-2xl font-bold">Loading GeoAware...</div>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
        <div className="container mx-auto">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <div className="container mx-auto">
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="map" element={<MapPage />} />

            {/* User-specific routes */}
            {role === "user" && <Route path="alert" element={<AlertPage />} />}

            {/* Responder-specific routes */}
            {role === "responder" && (
              <Route path="verify" element={<VerifyPage />} />
            )}

            {/* Admin-specific routes */}
            {role === "admin" && (
              <Route path="broadcast" element={<BroadcastPage />} />
            )}

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default App;
