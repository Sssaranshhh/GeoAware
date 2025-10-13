// src/components/LoginForm.jsx
import React from "react";

export default function LoginForm({ setIsLoggedIn, role, setUserName }) {
  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value || "";
    // derive a friendly name from email local part
    const local = email.split("@")[0] || "John Doe";
    const name = local
      .replace(/[\._]/g, " ")
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
    setUserName(name || "John Doe");
    setIsLoggedIn(true);
    alert(`Welcome! Logged in as ${role}`);
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Email</label>
        <input
          name="email"
          type="email"
          className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-600"
          placeholder="your@email.com"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-1">
          Password
        </label>
        <input
          name="password"
          type="password"
          className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-600"
          placeholder="••••••••"
          required
        />
      </div>
      <button className="w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white font-semibold rounded-lg hover:scale-105 transition transform">
        Login
      </button>
    </form>
  );
}
