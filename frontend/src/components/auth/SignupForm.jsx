import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";
import { signup, signin } from "../../services/authService"; // ✅ Added signin import

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

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
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
      // Call backend signup API
      const response = await signup(userData);

      if (response.success) {
        // For User role, auto-login them after signup
        if (role === "user") {
          try {
            const signinResponse = await signin({
              email: userData.email,
              password: userData.password,
            });

            // Decode token to get user info
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

            // Get username from signin response
            const userName = signinResponse.username || userData.fullname;

            // Update context with user info (this stores token via authService)
            login(decoded.role, userName, signinResponse.userId);

            alert("Account created successfully! Welcome to GeoAware.");
            navigate("/dashboard");
          } catch (loginError) {
            // If auto-login fails, show message and redirect to login
            alert("Account created! Please login with your credentials.");
            navigate("/auth");
          }
        } else {
          // For Admin and Official (responder), show pending message
          alert(
            `Signup successful! Your ${role} account is pending verification. You'll receive an email within 24-48 hours once approved.`
          );
          e.target.reset();
        }
      }
    } catch (err) {
      if (err.message === "User already exists") {
        setError("An account with this email or username already exists.");
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const requiresVerification = role !== "user";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Full Name
        </label>
        <input
          name="fullname"
          type="text"
          required
          placeholder="John Doe"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Phone Number
        </label>
        <input
          name="phone"
          type="tel"
          required
          placeholder="+91 XXXXX XXXXX"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          disabled={loading}
        />
      </div>

      {role === "responder" && (
        <>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Organization
            </label>
            <select
              name="organization"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
              disabled={loading}
            >
              <option value="">Select organization...</option>
              <option value="ndrf">NDRF</option>
              <option value="fire">Fire Department</option>
              <option value="police">Police</option>
              <option value="medical">Medical Services</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Employee ID
            </label>
            <input
              name="employeeId"
              type="text"
              required
              placeholder="EMP12345"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
              disabled={loading}
            />
          </div>
        </>
      )}

      {role === "admin" && (
        <>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Admin Code
            </label>
            <input
              name="adminCode"
              type="text"
              required
              placeholder="Enter admin authorization code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Department
            </label>
            <input
              name="department"
              type="text"
              required
              placeholder="Disaster Management Authority"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
              disabled={loading}
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          minLength="6"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Confirm Password
        </label>
        <input
          name="confirmPassword"
          type="password"
          required
          placeholder="••••••••"
          minLength="6"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white font-semibold rounded-lg transition transform ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
        }`}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      {requiresVerification && (
        <div className="bg-yellow-100 p-3 rounded-md text-sm text-center text-yellow-800">
          ⏳ {role.charAt(0).toUpperCase() + role.slice(1)} accounts require
          verification. You'll be notified within 24-48 hours.
        </div>
      )}
    </form>
  );
};

export default SignupForm;
