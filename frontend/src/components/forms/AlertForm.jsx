import React, { useState } from "react";

const AlertForm = ({ ws }) => {
  const [severity, setSeverity] = useState("");
  const [location, setLocation] = useState("");
  const [disasterType, setDisasterType] = useState(null);
  const [contact, setContact] = useState(null);
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId")

  const handleSubmit = (e) => {
    const data = {
      disasterType: disasterType,
      location: location,
      severity: severity,
      message: message,
      contact: contact
    }
    ws.send(JSON.stringify({
      type: "Message",
      userType: "User",
      content: data,
      userId: userId,
      receiverType: "Official",
      read: false
    }))
    alert("Alert sent to officials ✅")
  };

  const severityLevels = [
    { key: "Low", active: "bg-green-500 text-white border-green-500" },
    { key: "Moderate", active: "bg-yellow-400 text-black border-yellow-400" },
    { key: "High", active: "bg-orange-500 text-white border-orange-500" },
    { key: "Critical", active: "bg-red-500 text-white border-red-500" },
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
            onChange={(e) => {
              setDisasterType(e.target.value)
            }}
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
                className={`p-3 rounded-lg font-semibold border-2 transition ${severity === level.key
                    ? level.active
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
            onChange={(e) => {
              setLocation(e.target.value)
            }}
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
            onChange={(e) => {
              setContact(Number(e.target.value))
            }}
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
