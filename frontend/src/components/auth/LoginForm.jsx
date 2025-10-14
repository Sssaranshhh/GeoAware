import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";
import { signin } from "../../services/authService";

const LoginForm = () => {
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
      // Call backend API
      const response = await signin(credentials);

      // Decode token to get user info
      const token = response.token;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);

      // Extract name from email
      const localPart = credentials.email.split("@")[0];
      const userName =
        localPart
          .replace(/[._]/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") || "User";

      // Update context with user info
      login(decoded.role, userName, response.userId);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

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
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
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
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
