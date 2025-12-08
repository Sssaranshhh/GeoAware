import React, { useState } from "react";

const BroadcastForm = ({ws}) => {
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId")

  const handleSubmit = (e) => {
    if(message == ""){
      alert("Type some message");
      return;
    }
    ws.send(JSON.stringify({
        userId: userId,
        type: "Message",
        userType: "Admin",
        content: message
      }))
    alert("Broadcasted Successfully ✅")
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
            placeholder="Provide detailed information about the emergency and recommended actions..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition resize-none"
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
