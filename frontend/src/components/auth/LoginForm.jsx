import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";
import { signin } from "../../services/authService";
import { toast } from "react-toastify";

const LoginForm = ({ darkMode }) => {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await signin(credentials);
      const userName = response.username || "User";
      const token = response.token;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      );
      const decoded = JSON.parse(jsonPayload);
      login(decoded.role, userName, response.userId);
      toast.success("Login successful! Welcome back 👋");
      navigate("/dashboard");
    } catch (err) {
      const message = err.message || "Login failed. Please check your credentials.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { color: darkMode ? "#b3b3b3" : "#374151" };
  const inputClass = "w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500";
  const inputStyle = {
    backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
    borderColor: darkMode ? "#3a3a3a" : "#cbd5e1",
    color: darkMode ? "#ededed" : "#111827",
  };
  const errorStyle = {
    backgroundColor: darkMode ? "#2d0a0a" : "#fff1f2",
    borderColor: darkMode ? "#7f1d1d" : "#fecdd3",
    color: darkMode ? "#f87171" : "#be123c",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm flex items-start gap-2 border"
          style={errorStyle}
        >
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block font-medium mb-2 text-sm" style={labelStyle}>
          Email Address
        </label>
        <input
          name="email" type="email" required
          placeholder="you@example.com"
          disabled={loading}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block font-medium mb-2 text-sm" style={labelStyle}>
          Password
        </label>
        <input
          name="password" type="password" required
          placeholder="••••••••"
          disabled={loading}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${loading
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:scale-105 active:scale-100"
          }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Logging in...
          </span>
        ) : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
