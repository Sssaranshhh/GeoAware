import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";

const LoginForm = () => {
  const { role, login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");

    // Extract name from email
    const localPart = email.split("@")[0];
    const userName =
      localPart
        .replace(/[._]/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") || "User";

    login(role, userName);
    navigate("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 font-semibold mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
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
        />
      </div>

      <button
        type="submit"
        className="w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white font-semibold rounded-lg hover:scale-105 transition transform"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
