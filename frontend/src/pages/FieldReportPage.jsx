import React from "react";
import FieldReportForm from "../components/forms/FieldReportForm";

const FieldReportPage = ({ darkMode }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: darkMode ? "#ededed" : "#1e293b" }}
        >
          Field Status Report 📋
        </h2>
        <h3
            className="text-sm mt-1"
            style={{ color: darkMode ? "#8a8a8a" : "#64748b" }}
        >
            Report resource needs, injuries, and road conditions directly from the field.
        </h3>
      </div>

      <FieldReportForm darkMode={darkMode} />
    </div>
  );
};

export default FieldReportPage;
