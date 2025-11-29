import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";
import { signup, signin } from "../../services/authService";
import { toast } from "react-toastify";

const SignupForm = () => {
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
      password: password,
      userType: mapRoleToUserType(role),
      phone: formData.get("phone"),
    };

    try {
      const response = await signup(userData);

      if (response.success) {
        if (role === "user") {
          try {
            const signinResponse = await signin({
              email: userData.email,
              password: userData.password,
            });

            const token = signinResponse.token;
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(
                  (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
            );
            const decoded = JSON.parse(jsonPayload);

            const userName = signinResponse.username || userData.fullname;
            login(decoded.role, userName, signinResponse.userId);

            toast.success(
              "Account created successfully! Welcome to GeoAware 🎉"
            );
            navigate("/dashboard");
          } catch (loginError) {
            toast.info("Account created! Please login with your credentials.");
            navigate("/auth");
          }
        } else {
          toast.info(
            `Signup successful! Your ${role} account is pending verification.`
          );
          e.target.reset();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <span className="text-rose-500 mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-slate-700 font-medium mb-2 text-sm">
          Full Name
        </label>
        <input
          name="fullname"
          type="text"
          required
          placeholder="John Doe"
          disabled={loading}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>

      <div>
        <label className="block text-slate-700 font-medium mb-2 text-sm">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          disabled={loading}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>

      <div>
        <label className="block text-slate-700 font-medium mb-2 text-sm">
          Phone Number
        </label>
        <input
          name="phone"
          type="tel"
          required
          placeholder="+91 XXXXX XXXXX"
          disabled={loading}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>

      {role === "responder" && (
        <>
          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              Organization
            </label>
            <select
              name="organization"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">Select organization...</option>
              <option value="ndrf">NDRF</option>
              <option value="fire">Fire Department</option>
              <option value="police">Police</option>
              <option value="medical">Medical Services</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              Employee ID
            </label>
            <input
              name="employeeId"
              type="text"
              required
              placeholder="EMP12345"
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
        </>
      )}

      {role === "admin" && (
        <>
          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              Admin Code
            </label>
            <input
              name="adminCode"
              type="text"
              required
              placeholder="Enter admin authorization code"
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              Department
            </label>
            <input
              name="department"
              type="text"
              required
              placeholder="Disaster Management Authority"
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-slate-700 font-medium mb-2 text-sm">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          minLength="6"
          disabled={loading}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>

      <div>
        <label className="block text-slate-700 font-medium mb-2 text-sm">
          Confirm Password
        </label>
        <input
          name="confirmPassword"
          type="password"
          required
          placeholder="••••••••"
          minLength="6"
          disabled={loading}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
          loading
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:scale-105 active:scale-100"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Signing up...
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      {requiresVerification && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-center">
          <div className="flex items-center justify-center gap-2 text-amber-700">
            <span className="text-xl">⏳</span>
            <span className="font-medium">
              {role.charAt(0).toUpperCase() + role.slice(1)} accounts require
              verification
            </span>
          </div>
          <p className="text-amber-600 mt-1 text-xs">
            You'll be notified within 24-48 hours once approved
          </p>
        </div>
      )}
    </form>
  );
};

export default SignupForm;
