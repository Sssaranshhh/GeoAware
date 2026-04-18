import React, { useState } from "react";
import api from "../../services/api";
import { useAppContext } from "../../Context/AppContext";

const MissingPersonForm = ({ darkMode }) => {
  const { userId } = useAppContext();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [physicalDescription, setPhysicalDescription] = useState("");
  const [lastKnownLocation, setLastKnownLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("reporterId", userId);
    formData.append("name", name);
    formData.append("age", age);
    formData.append("physicalDescription", physicalDescription);
    formData.append("lastKnownLocation", lastKnownLocation);
    formData.append("contactNumber", contactNumber);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await api.post("/missing-persons", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("✅ Missing person report submitted successfully!");
        // Reset form
        setName("");
        setAge("");
        setPhysicalDescription("");
        setLastKnownLocation("");
        setContactNumber("");
        setImage(null);
        setPreview(null);
      }
    } catch (error) {
      console.error("Error submitting missing person report:", error);
      alert("❌ Failed to submit report. Please try again.");
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
          {/* Name */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: labelColor }}>
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Full name of the person"
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Age */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: labelColor }}>
              Approximate Age
            </label>
            <input
              type="number"
              required
              placeholder="E.g., 25"
              style={inputStyle}
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
        </div>

        {/* Physical Description */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Physical Description
          </label>
          <textarea
            required
            rows="3"
            placeholder="Height, outfit at last seen, distinguishing marks..."
            style={{ ...inputStyle, resize: "none" }}
            value={physicalDescription}
            onChange={(e) => setPhysicalDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Last Known Location */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: labelColor }}>
              Last Known Area
            </label>
            <input
              type="text"
              required
              placeholder="E.g., Central Park East Shore"
              style={inputStyle}
              value={lastKnownLocation}
              onChange={(e) => setLastKnownLocation(e.target.value)}
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: labelColor }}>
              Your Contact Number
            </label>
            <input
              type="tel"
              required
              placeholder="Phone number for updates"
              style={inputStyle}
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: labelColor }}>
            Recent Photo (Highly Recommended)
          </label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-colors"
               style={{ borderColor: darkMode ? "#3a3a3a" : "#e2e8f0", backgroundColor: darkMode ? "#1a1a1a" : "#f8fafc" }}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="photo-upload"
              onChange={handleImageChange}
            />
            {preview ? (
              <div className="relative w-full max-w-[200px] aspect-square">
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => { setImage(null); setPreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label htmlFor="photo-upload" className="cursor-pointer text-center py-4">
                <span className="text-4xl mb-2 block">📸</span>
                <span className="text-blue-500 font-medium">Click to upload photo</span>
                <p className="text-xs mt-1 text-gray-500">JPG, PNG up to 5MB</p>
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full p-4 bg-gradient-to-br from-red-600 to-orange-700 text-white rounded-lg font-bold hover:scale-[1.02] transition transform shadow-lg ${
            submitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Submitting Report..." : "📢 Submit Missing Person Report"}
        </button>
      </div>
    </form>
  );
};

export default MissingPersonForm;
