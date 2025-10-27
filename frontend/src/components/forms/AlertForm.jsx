import React, { useState } from "react";

const AlertForm = () => {
  const [severity, setSeverity] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      type: formData.get("type"),
      severity,
      location: formData.get("location"),
      description: message,
      contact: formData.get("contact"),
    };

    alert(
      `Alert submitted successfully!\n\nType: ${data.type}\nSeverity: ${data.severity}\nLocation: ${data.location}`
    );
    e.target.reset();
    setMessage("");
    setSeverity("");
  };

  const severityLevels = [
    { key: "Low", color: "green-500" },
    { key: "Moderate", color: "yellow-400" },
    { key: "High", color: "orange-500" },
    { key: "Critical", color: "red-500" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-md max-w-3xl mx-auto"
    >
      <div className="space-y-4">
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Disaster Type
          </label>
          <select
            name="type"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          >
            <option value="">Select disaster type...</option>
            <option value="landslide">Landslide</option>
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="fire">Wildfire</option>
            <option value="storm">Severe Storm</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Severity Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {severityLevels.map((level) => (
              <button
                key={level.key}
                type="button"
                onClick={() => setSeverity(level.key)}
                className={`p-3 rounded-lg font-semibold border-2 transition ${
                  severity === level.key
                    ? `bg-${level.color} text-white border-${level.color}`
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {level.key}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Location
          </label>
          <input
            name="location"
            type="text"
            required
            placeholder="Address or landmark (e.g., Main Street, Near City Hall)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
          <p className="text-sm text-gray-500 mt-1">
            📍 Auto-detected: Current Location
          </p>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            required
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what you're witnessing in detail..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition resize-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Contact Number (Optional)
          </label>
          <input
            name="contact"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white rounded-lg font-semibold hover:scale-105 transition transform"
        >
          🚨 Submit Alert
        </button>
      </div>
    </form>
  );
};

export default AlertForm;
