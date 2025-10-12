// src/components/Auth.jsx
import React from "react";
import { useState } from "react";
import RoleSelector from "./RoleSelector";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function Auth({ role, setRole, setIsLoggedIn, setUserName }) {
  const [tab, setTab] = useState("login");

  const roleInfoHtml =
    role === "user"
      ? "<strong>User Role:</strong> Report disasters you witness and help keep your community safe."
      : role === "responder"
      ? "<strong>Responder Role:</strong> Verify reports and coordinate emergency response teams (NDRF, Fire, Police, Medical)."
      : "<strong>Admin Role:</strong> Send official alerts and broadcasts to warn communities about disasters.";

  return (
    <div className="flex justify-center items-center min-h-[90vh]">
      <div className="bg-white/95 p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center text-5xl mb-2">🌍</div>
        <div className="text-center text-2xl font-bold text-gray-800 mb-1">GeoAware</div>
        <div className="text-center text-gray-600 mb-6">
          Disaster Monitoring & Response System
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            className={`flex-1 p-3 rounded-lg font-semibold ${
              tab === "login" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 p-3 rounded-lg font-semibold ${
              tab === "signup" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Role Selector */}
        <RoleSelector role={role} setRole={setRole} />

        {/* Role Info */}
        <div
          className="bg-blue-50 p-3 rounded-md mb-5 text-sm"
          dangerouslySetInnerHTML={{ __html: roleInfoHtml }}
        ></div>

        {/* Forms */}
        {tab === "login" ? (
          <LoginForm setIsLoggedIn={setIsLoggedIn} role={role} setUserName={setUserName} />
        ) : (
          <SignupForm role={role} setIsLoggedIn={setIsLoggedIn} setUserName={setUserName} />
        )}
      </div>
    </div>
  );
}
