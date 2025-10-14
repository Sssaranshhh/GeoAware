import React, { useState } from "react";
import { useAppContext } from "../Context/AppContext";
import RoleSelector from "../components/auth/RoleSelector";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

const AuthPage = () => {
  const [tab, setTab] = useState("login");
  const { role } = useAppContext();

  const roleDescriptions = {
    user: "<strong>User Role:</strong> Report disasters you witness and help keep your community safe.",
    responder:
      "<strong>Responder Role:</strong> Verify reports and coordinate emergency response teams (NDRF, Fire, Police, Medical).",
    admin:
      "<strong>Admin Role:</strong> Send official alerts and broadcasts to warn communities about disasters.",
  };

  return (
    <div className="flex justify-center items-center min-h-[90vh]">
      <div className="bg-white/95 p-10 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center text-5xl mb-2">🌍</div>
        <h1 className="text-center text-2xl font-bold text-gray-800 mb-1">
          GeoAware
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Disaster Monitoring & Response System
        </p>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 p-3 rounded-lg font-semibold transition ${
              tab === "login"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 p-3 rounded-lg font-semibold transition ${
              tab === "signup"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Role Selector */}
        <RoleSelector />

        {/* Role Description */}
        <div
          className="bg-blue-50 p-3 rounded-md mb-5 text-sm"
          dangerouslySetInnerHTML={{ __html: roleDescriptions[role] }}
        />

        {/* Auth Forms */}
        {tab === "login" ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
};

export default AuthPage;
