import React, { useState } from "react";
import api from "../../services/api";
import { useAppContext } from "../../Context/AppContext";

const FieldReportForm = ({ darkMode }) => {
  const { userId, userName } = useAppContext();
  const [location, setLocation] = useState("");
  const [designation, setDesignation] = useState("");
  const [disasterType, setDisasterType] = useState("");
  const [peopleHelped, setPeopleHelped] = useState(0);
  const [injuredCount, setInjuredCount] = useState(0);
  const [resourcesNeeded, setResourcesNeeded] = useState([]);
  const [roadCondition, setRoadCondition] = useState("passable");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resourceOptions = [
    "Food",
    "Water",
    "Medicine",
    "Shelter",
    "Clothing",
    "Tools",
  ];

  const handleResourceChange = (resource) => {
    setResourcesNeeded((prev) =>
      prev.includes(resource)
        ? prev.filter((r) => r !== resource)
        : [...prev, resource]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const reportData = {
      responderId: userId,
      responderName: userName,
      responderDesignation: designation,
      disasterType,
      location,
      peopleHelped,
      injuredCount,
      resourcesNeeded,
      roadCondition,
      notes,
    };

    try {
      const response = await api.post("/field-reports", reportData);
      if (response.data.success) {
        alert("✅ Field report submitted successfully!");
        // Reset form
        setLocation("");
        setDesignation("");
        setDisasterType("");
        setPeopleHelped(0);
        setInjuredCount(0);
        setResourcesNeeded([]);
        setRoadCondition("passable");
        setNotes("");
      }
    } catch (error) {
      console.error("Error submitting field report:", error);
      alert("❌ Failed to submit field report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl shadow-md max-w-3xl mx-auto"
      style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: labelColor }}>
              Location / Area
            </label>
            <input
              type="text"
              required
              placeholder="E.g., North Sector"
              style={inputStyle}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Designation */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: labelColor }}>
              Your Designation
            </label>
            <input
              type="text"
              required
              placeholder="E.g., Rescue Lead, Doctor"
              style={inputStyle}
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
          </div>
        </div>

        {/* Disaster Type */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Type of Disaster
          </label>
          <select
            required
            style={inputStyle}
            value={disasterType}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* People Helped */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: labelColor }}>
              People Helped
            </label>
            <input
              type="number"
              min="0"
              style={inputStyle}
              value={peopleHelped}
              onChange={(e) => setPeopleHelped(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Injured Count */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: labelColor }}>
              Injured People Found
            </label>
            <input
              type="number"
              min="0"
              style={inputStyle}
              value={injuredCount}
              onChange={(e) => setInjuredCount(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Resources Needed */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Resources Needed
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {resourceOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition"
                style={{
                  borderColor: resourcesNeeded.includes(option)
                    ? "#3b82f6"
                    : darkMode
                    ? "#3a3a3a"
                    : "#d1d5db",
                  backgroundColor: resourcesNeeded.includes(option)
                    ? "rgba(59, 130, 246, 0.1)"
                    : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={resourcesNeeded.includes(option)}
                  onChange={() => handleResourceChange(option)}
                />
                <span className={resourcesNeeded.includes(option) ? "text-blue-500 font-medium" : ""}>
                  {resourcesNeeded.includes(option) ? "✅" : "⬜"} {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Road Condition */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Road Conditions
          </label>
          <select
            style={inputStyle}
            value={roadCondition}
            onChange={(e) => setRoadCondition(e.target.value)}
          >
            <option value="passable">Passable (Clear)</option>
            <option value="partially_blocked">Partially Blocked</option>
            <option value="blocked">Blocked / Impassable</option>
          </select>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Site Notes / Observations
          </label>
          <textarea
            rows="4"
            placeholder="Provide any additional critical information..."
            style={{ ...inputStyle, resize: "none" }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full p-3 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-lg font-semibold hover:scale-[1.02] transition transform shadow-lg ${
            submitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Submitting..." : "📋 Submit Field Report"}
        </button>
      </div>
    </form>
  );
};

export default FieldReportForm;
