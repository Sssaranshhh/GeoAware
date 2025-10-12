// src/components/SignupForm.jsx
import React from "react";

export default function SignupForm({ role, setIsLoggedIn, setUserName }) {
  const showVerification = role !== "user";

  const handleSignup = (e) => {
    e.preventDefault();
    const form = e.target;
    const fullName = form.fullname?.value || "John Doe";

    if (role === "user") {
      setUserName(fullName);
      setIsLoggedIn(true);
      alert("Account created successfully! Welcome to GeoAware.");
    } else {
      alert(
        `Signup successful! Your ${role} account is pending verification. You'll receive an email within 24-48 hours once approved.`
      );
      form.reset();
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
        <input
          name="fullname"
          type="text"
          className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-600"
          placeholder="John Doe"
          required
        />
      </div>
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
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
        <input
          name="phone"
          type="tel"
          className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-600"
          placeholder="+91 XXXXX XXXXX"
          required
        />
      </div>

      {role === "responder" && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Organization</label>
            <select
              name="organization"
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-600"
              required
            >
              <option value="">Select organization...</option>
              <option value="ndrf">NDRF</option>
              <option value="fire">Fire Department</option>
              <option value="police">Police</option>
              <option value="medical">Medical Services</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Employee ID</label>
            <input
              name="employeeId"
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="EMP12345"
              required
            />
          </div>
        </>
      )}

      {role === "admin" && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Admin Code</label>
            <input
              name="adminCode"
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="Enter admin authorization code"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Department</label>
            <input
              name="department"
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="Disaster Management Authority"
              required
            />
          </div>
        </>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Password</label>
        <input
          name="password"
          type="password"
          className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-600"
          placeholder="••••••••"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-600"
          placeholder="••••••••"
          required
        />
      </div>

      <button className="w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white font-semibold rounded-lg hover:scale-105 transition transform mb-3">
        Sign Up
      </button>

      {showVerification && (
        <div className="bg-yellow-100 p-3 rounded-md text-sm text-center">
          ⏳ Responder and Admin accounts require verification. You'll be notified within 24-48 hours.
        </div>
      )}
    </form>
  );
}
