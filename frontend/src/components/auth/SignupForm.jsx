import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";
import { signup, signin } from "../../services/authService";
import { toast } from "react-toastify";

const SignupForm = ({ darkMode }) => {
  const { role, login, mapRoleToUserType } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    const userData = {
      fullname: formData.get("fullname"),
      email: formData.get("email"),
      password,
      userType: mapRoleToUserType(role),
      phone: formData.get("phone"),
    };

    try {
      const response = await signup(userData);
      if (response.success) {
        try {
          const signinResponse = await signin({ email: userData.email, password: userData.password });
          const token = signinResponse.token;
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
          );
          const decoded = JSON.parse(jsonPayload);
          const userName = signinResponse.username || userData.fullname;
          login(decoded.role, userName, signinResponse.userId);
          toast.success("Account created successfully! Welcome to GeoAware 🎉");
          navigate("/dashboard");
        } catch {
          toast.info("Account created! Please login with your credentials.");
          navigate("/auth");
        }
      }
    } catch (err) {
      if (err.message === "User already exists") {
        setError("An account with this email or username already exists.");
        toast.error("Account already exists. Try logging in instead.");
      } else {
        setError(err.message || "Signup failed. Please try again.");
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const requiresVerification = role !== "user";

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
  const verifyStyle = {
    backgroundColor: darkMode ? "#2d1f00" : "#fffbeb",
    borderColor: darkMode ? "#92400e" : "#fde68a",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm flex items-start gap-2 border" style={errorStyle}>
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block font-medium mb-2 text-sm" style={labelStyle}>Full Name</label>
        <input name="fullname" type="text" required placeholder="John Doe" disabled={loading} className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className="block font-medium mb-2 text-sm" style={labelStyle}>Email Address</label>
        <input name="email" type="email" required placeholder="you@example.com" disabled={loading} className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className="block font-medium mb-2 text-sm" style={labelStyle}>Phone Number</label>
        <input name="phone" type="tel" required placeholder="+91 XXXXX XXXXX" disabled={loading} className={inputClass} style={inputStyle} />
      </div>

      {role === "responder" && (
        <>
          <div>
            <label className="block font-medium mb-2 text-sm" style={labelStyle}>Organization</label>
            <select name="organization" required disabled={loading} className={inputClass} style={inputStyle}>
              <option value="">Select organization...</option>
              <option value="ndrf">NDRF</option>
              <option value="fire">Fire Department</option>
              <option value="police">Police</option>
              <option value="medical">Medical Services</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-2 text-sm" style={labelStyle}>Employee ID</label>
            <input name="employeeId" type="text" required placeholder="EMP12345" disabled={loading} className={inputClass} style={inputStyle} />
          </div>
        </>
      )}

      {role === "admin" && (
        <>
          <div>
            <label className="block font-medium mb-2 text-sm" style={labelStyle}>Admin Code</label>
            <input name="adminCode" type="text" required placeholder="Enter admin authorization code" disabled={loading} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block font-medium mb-2 text-sm" style={labelStyle}>Department</label>
            <input name="department" type="text" required placeholder="Disaster Management Authority" disabled={loading} className={inputClass} style={inputStyle} />
          </div>
        </>
      )}

      <div>
        <label className="block font-medium mb-2 text-sm" style={labelStyle}>Password</label>
        <input name="password" type="password" required placeholder="••••••••" minLength="6" disabled={loading} className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className="block font-medium mb-2 text-sm" style={labelStyle}>Confirm Password</label>
        <input name="confirmPassword" type="password" required placeholder="••••••••" minLength="6" disabled={loading} className={inputClass} style={inputStyle} />
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
            Signing up...
          </span>
        ) : "Create Account"}
      </button>

      {requiresVerification && (
        <div className="p-4 rounded-xl text-sm text-center border" style={verifyStyle}>
          <div className="flex items-center justify-center gap-2" style={{ color: darkMode ? "#fbbf24" : "#92400e" }}>
            <span className="text-xl">⏳</span>
            <span className="font-medium">
              {role.charAt(0).toUpperCase() + role.slice(1)} accounts require verification
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: darkMode ? "#d97706" : "#b45309" }}>
            You'll be notified within 24-48 hours once approved
          </p>
        </div>
      )}
    </form>
  );
};

export default SignupForm;
