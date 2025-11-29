import React, { useState } from "react";
import { toast } from "react-toastify";

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

    // Toast replacing alert
    toast.success("🚨 Alert submitted successfully!");

    e.target.reset();
    setMessage("");
    setSeverity("");
  };

  const severityLevels = [
    { key: "Low", color: "emerald" },
    { key: "Moderate", color: "blue" },
    { key: "High", color: "red" },
    { key: "Critical", color: "rose" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 p-8 rounded-2xl shadow-md max-w-3xl mx-auto space-y-8"
    >
      {/* Disaster Type */}
      <div>
        <label className="block font-semibold text-slate-800 mb-2">
          Disaster Type
        </label>
        <select
          name="type"
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
          transition-all"
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

      {/* Severity Level */}
      <div>
        <label className="block font-semibold text-slate-800 mb-3">
          Severity Level
        </label>
        <div className="grid grid-cols-4 gap-3">
          {severityLevels.map((level) => (
            <button
              key={level.key}
              type="button"
              onClick={() => setSeverity(level.key)}
              className={`py-3 rounded-xl font-medium border-2 transition-all 
                ${
                  severity === level.key
                    ? `bg-${level.color}-600 text-white border-${level.color}-600 shadow-md scale-105`
                    : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:shadow-sm"
                }`}
            >
              {level.key}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block font-semibold text-slate-800 mb-2">
          Location
        </label>
        <input
          name="location"
          type="text"
          required
          placeholder="Address or landmark (e.g., Main Street, Near City Hall)"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <p className="text-sm text-slate-500 mt-1">
          📍 Auto-detected: Current Location
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block font-semibold text-slate-800 mb-2">
          Description
        </label>
        <textarea
          name="description"
          required
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe what you're witnessing in detail..."
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Contact Number */}
      <div>
        <label className="block font-semibold text-slate-800 mb-2">
          Contact Number (Optional)
        </label>
        <input
          name="contact"
          type="tel"
          placeholder="+91 XXXXX XXXXX"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3 rounded-xl font-semibold text-white 
        bg-gradient-to-r from-indigo-600 to-blue-600 
        hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:scale-105 
        active:scale-100 transition-all shadow-lg"
      >
        🚨 Submit Alert
      </button>
    </form>
  );
};

export default AlertForm;
