import React, { useState } from "react";
import { toast } from "react-toastify";

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

    toast.success("📢 Broadcast Alert Sent!");

    e.target.reset();
    setMessage("");
    setPriority("medium");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 p-8 rounded-2xl shadow-md max-w-3xl mx-auto space-y-8"
    >
      {/* Alert Type */}
      <div>
        <label className="block font-semibold text-slate-800 mb-2">
          Alert Type
        </label>
        <select
          name="alertType"
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
          transition-all"
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

      {/* Severity */}
      <div>
        <label className="block font-semibold text-slate-800 mb-2">
          Severity Level
        </label>
        <select
          name="severity"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
          transition-all"
        >
          <option value="low">Advisory</option>
          <option value="medium">Watch</option>
          <option value="high">Warning</option>
          <option value="critical">Emergency</option>
        </select>
      </div>

      {/* Region */}
      <div>
        <label className="block font-semibold text-slate-800 mb-2">
          Affected Region
        </label>
        <input
          name="region"
          type="text"
          required
          placeholder="e.g., Shimla District, Sector 1-5"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
          transition-all"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block font-semibold text-slate-800 mb-2">
          Alert Message
        </label>
        <textarea
          name="message"
          required
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Provide detailed information about the emergency..."
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
          transition-all resize-none"
        />
      </div>

      {/* Actions */}
      <div>
        <label className="block font-semibold text-slate-800 mb-2">
          Recommended Actions
        </label>
        <textarea
          name="actions"
          required
          rows="3"
          placeholder="Safety measures and evacuation instructions..."
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
          transition-all resize-none"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block font-semibold text-slate-800 mb-2">
          Alert Duration (hours)
        </label>
        <input
          name="duration"
          type="number"
          required
          min="1"
          placeholder="24"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
          transition-all"
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
        📢 Send Broadcast Alert
      </button>
    </form>
  );
};

export default BroadcastForm;
