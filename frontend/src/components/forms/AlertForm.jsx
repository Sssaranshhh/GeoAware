import React, { useState } from "react";

const AlertForm = ({ ws, darkMode }) => {
  const [severity, setSeverity] = useState("");
  const [location, setLocation] = useState("");
  const [disasterType, setDisasterType] = useState(null);
  const [contact, setContact] = useState(null);
  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("❌ Connection lost. Please wait a moment or refresh the page.");
      return;
    }

    let photoUrl = null;

    if (photoFile) {
      try {
        const formData = new FormData();
        formData.append("photo", photoFile);

        const res = await fetch(`${import.meta.env.VITE_API_URL}/alert-photo`, {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || "Image upload failed");
        }

        photoUrl = result.photoUrl;
      } catch (error) {
        console.error("Photo upload error:", error);
        alert("❌ Photo upload failed. Please try again.");
        return;
      }
    }

    const data = { disasterType, location, severity, message, contact, photoUrl };
    ws.send(JSON.stringify({
      type: "Message",
      userType: "User",
      content: data,
      userId: userId,
      receiverType: "Official",
      read: false,
    }));
    alert("Alert sent to officials ✅");
    setPhotoFile(null);
  };

  const severityLevels = [
    { key: "Low", active: "bg-green-500 text-white border-green-500" },
    { key: "Moderate", active: "bg-yellow-400 text-black border-yellow-400" },
    { key: "High", active: "bg-orange-500 text-white border-orange-500" },
    { key: "Critical", active: "bg-red-500 text-white border-red-500" },
  ];

  const cardBg = darkMode ? "#242424" : "#ffffff";
  const cardBorder = darkMode ? "#3a3a3a" : "#e2e8f0";
  const labelColor = darkMode ? "#b3b3b3" : "#374151";
  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${darkMode ? "#3a3a3a" : "#d1d5db"}`,
    backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
    color: darkMode ? "#ededed" : "#111827",
    outline: "none",
    transition: "border-color 0.2s",
  };
  const hintColor = darkMode ? "#6b7280" : "#6b7280";
  const inactiveBtnStyle = {
    backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
    color: darkMode ? "#b3b3b3" : "#374151",
    borderColor: darkMode ? "#4a4a4a" : "#d1d5db",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl shadow-md max-w-3xl mx-auto"
      style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
    >
      <div className="space-y-5">
        {/* Disaster Type */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Disaster Type
          </label>
          <select
            required
            style={inputStyle}
            onChange={(e) => setDisasterType(e.target.value)}
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

        {/* Severity */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Severity Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {severityLevels.map((level) => (
              <button
                key={level.key}
                type="button"
                onClick={() => setSeverity(level.key)}
                className={`p-3 rounded-lg font-semibold border-2 transition ${severity === level.key ? level.active : ""
                  }`}
                style={severity === level.key ? {} : inactiveBtnStyle}
              >
                {level.key}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Location
          </label>
          <input
            type="text"
            required
            placeholder="Address or landmark (e.g., Main Street, Near City Hall)"
            style={inputStyle}
            onChange={(e) => setLocation(e.target.value)}
          />
          <p className="text-sm mt-1" style={{ color: hintColor }}>
            📍 Auto-detected: Current Location
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Description
          </label>
          <textarea
            required
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what you're witnessing in detail..."
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>

        {/* Photo Evidence */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Photo Evidence (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            style={{ ...inputStyle, padding: "10px 12px" }}
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
          {photoFile && (
            <p className="text-sm mt-2" style={{ color: hintColor }}>
              Selected file: {photoFile.name}
            </p>
          )}
        </div>

        {/* Contact */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Contact Number (Optional)
          </label>
          <input
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            style={inputStyle}
            onChange={(e) => setContact(Number(e.target.value))}
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
