import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";

const SignupForm = () => {
  const { role, login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fullName = formData.get("fullname");

    if (role === "user") {
      login(role, fullName);
      navigate("/dashboard");
    } else {
      alert(
        `Signup successful! Your ${role} account is pending verification. You'll receive an email within 24-48 hours once approved.`
      );
      e.target.reset();
    }
  };

  const requiresVerification = role !== "user";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
        />
      </div>

      <button
        type="submit"
        className="w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white font-semibold rounded-lg hover:scale-105 transition transform"
      >
        Sign Up
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
