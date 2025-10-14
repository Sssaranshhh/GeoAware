import React, { useState } from "react";

const BroadcastForm = () => {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      alertType: formData.get("alertType"),
      severity: priority,
      region: formData.get("region"),
      message,
      actions: formData.get("actions"),
      duration: formData.get("duration"),
    };

    alert(
      `Broadcast Alert Sent!\n\nType: ${data.alertType}\nSeverity: ${data.severity}\nRegion: ${data.region}\n\nMessage: ${data.message}`
    );

    e.target.reset();
    setMessage("");
    setPriority("medium");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-md max-w-3xl mx-auto"
    >
      <div className="space-y-4">
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Alert Type
          </label>
          <select
            name="alertType"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          >
            <option value="">Select alert type...</option>
            <option value="landslide">Landslide Warning</option>
            <option value="flood">Flood Warning</option>
            <option value="earthquake">Earthquake Alert</option>
            <option value="fire">Fire Warning</option>
            <option value="storm">Storm Warning</option>
            <option value="evacuation">Evacuation Order</option>
            <option value="all-clear">All Clear</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Severity Level
          </label>
          <select
            name="severity"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          >
            <option value="low">Advisory</option>
            <option value="medium">Watch</option>
            <option value="high">Warning</option>
            <option value="critical">Emergency</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Affected Region
          </label>
          <input
            name="region"
            type="text"
            required
            placeholder="e.g., Shimla District, Sector 1-5"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Alert Message
          </label>
          <textarea
            name="message"
            required
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide detailed information about the emergency..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition resize-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Recommended Actions
          </label>
          <textarea
            name="actions"
            required
            rows="3"
            placeholder="List safety measures and evacuation instructions if applicable..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition resize-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Alert Duration (hours)
          </label>
          <input
            name="duration"
            type="number"
            required
            min="1"
            placeholder="24"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-gradient-to-br from-blue-500 to-purple-700 text-white rounded-lg font-semibold hover:scale-105 transition transform"
        >
          📢 Send Broadcast Alert
        </button>
      </div>
    </form>
  );
};

export default BroadcastForm;
