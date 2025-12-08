import React, { useState } from "react";
import { useAppContext } from "../Context/AppContext";
import RoleSelector from "../components/auth/RoleSelector";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

const AuthPage = () => {
  const [tab, setTab] = useState("login");
  const { role } = useAppContext();

  const roleDescriptions = {
    user: '<strong class="text-indigo-700">User Role:</strong> Report disasters you witness and help keep your community safe.',
    responder:
      '<strong class="text-indigo-700">Responder Role:</strong> Verify reports and coordinate emergency response teams (NDRF, Fire, Police, Medical).',
    admin:
      '<strong class="text-indigo-700">Admin Role:</strong> Send official alerts and broadcasts to warn communities about disasters.',
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🌍</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">GeoAware</h1>
          </div>
          <p className="text-slate-600 text-sm">
            Disaster Monitoring & Response System
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-4 font-semibold transition-all ${
                tab === "login"
                  ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-4 font-semibold transition-all ${
                tab === "signup"
                  ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Role Selector */}
            <RoleSelector />

            {/* Role Description */}
            <div
              className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6 text-sm text-slate-700"
              dangerouslySetInnerHTML={{ __html: roleDescriptions[role] }}
            />

            {/* Auth Forms */}
            {tab === "login" ? <LoginForm /> : <SignupForm />}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
