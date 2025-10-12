// src/components/MainApp.jsx
import React from "react";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import MapView from "./MapView";
import AlertForm from "./AlertForm";
import VerifyReports from "./VerifyReports";
import BroadcastForm from "./BroadcastForm";

export default function MainApp({ role, userName, setIsLoggedIn }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex min-h-[80vh] bg-transparent rounded-xl overflow-hidden shadow-xl">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      <div className="flex-1 flex flex-col bg-gray-50">
        <Header userName={userName} setIsLoggedIn={setIsLoggedIn} />
        <div className="p-6 flex-1 overflow-auto">
          {activeTab === "dashboard" && <Dashboard role={role} />}
          {activeTab === "map" && <MapView />}
          {activeTab === "alert" && role === "user" && <AlertForm />}
          {activeTab === "verify" && role === "responder" && <VerifyReports />}
          {activeTab === "broadcast" && role === "admin" && <BroadcastForm />}
        </div>
      </div>
    </div>
  );
}
