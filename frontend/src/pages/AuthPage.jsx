import React, { useState } from "react";
import { useAppContext } from "../Context/AppContext";
import RoleSelector from "../components/auth/RoleSelector";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

const AuthPage = () => {
  const [tab, setTab] = useState("login");
  const { role } = useAppContext();

  // Auth lives outside the authenticated layout so we read darkMode from storage
  const darkMode = JSON.parse(localStorage.getItem("darkMode") || "false");

  const roleDescriptions = {
    user: `<strong style="color:#818cf8">User Role:</strong> Report disasters you witness and help keep your community safe.`,
    responder: `<strong style="color:#818cf8">Responder Role:</strong> Verify reports and coordinate emergency response teams (NDRF, Fire, Police, Medical).`,
    admin: `<strong style="color:#818cf8">Admin Role:</strong> Send official alerts and broadcasts to warn communities about disasters.`,
  };

  const bg = darkMode ? "#191919" : "#f1f5f9";
  const cardBg = darkMode ? "#242424" : "#ffffff";
  const cardBorder = darkMode ? "#3a3a3a" : "#e2e8f0";
  const tabBarBg = darkMode ? "#1e1e1e" : "#f8fafc";
  const tabBorderBottom = darkMode ? "#3a3a3a" : "#e2e8f0";
  const titleColor = darkMode ? "#ededed" : "#1e293b";
  const subtitleColor = darkMode ? "#8a8a8a" : "#64748b";
  const footerColor = darkMode ? "#6b7280" : "#94a3b8";
  const roleBg = darkMode ? "#1e1e3a" : "#eef2ff";
  const roleBorder = darkMode ? "#3730a3" : "#c7d2fe";
  const roleText = darkMode ? "#c7d2fe" : "#475569";

  const activeTab = darkMode
    ? "bg-[#242424] text-indigo-400 border-b-2 border-indigo-400"
    : "bg-white text-indigo-600 border-b-2 border-indigo-600";
  const inactiveTab = darkMode
    ? "text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]"
    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100";

  return (
    <div
      className="flex justify-center items-center min-h-screen p-4"
      style={{ backgroundColor: bg }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🌍</span>
            </div>
            <h1 className="text-3xl font-bold" style={{ color: titleColor }}>
              GeoAware
            </h1>
          </div>
          <p className="text-sm" style={{ color: subtitleColor }}>
            Disaster Monitoring &amp; Response System
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-2xl shadow-xl overflow-hidden border"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}
        >
          {/* Tab Switcher */}
          <div
            className="flex border-b"
            style={{ backgroundColor: tabBarBg, borderColor: tabBorderBottom }}
          >
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-4 font-semibold transition-all ${tab === "login" ? activeTab : inactiveTab}`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-4 font-semibold transition-all ${tab === "signup" ? activeTab : inactiveTab}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <RoleSelector darkMode={darkMode} />

            <div
              className="p-4 rounded-xl mb-6 text-sm border"
              style={{ backgroundColor: roleBg, borderColor: roleBorder, color: roleText }}
              dangerouslySetInnerHTML={{ __html: roleDescriptions[role] }}
            />

            {tab === "login"
              ? <LoginForm darkMode={darkMode} />
              : <SignupForm darkMode={darkMode} />
            }
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: footerColor }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
