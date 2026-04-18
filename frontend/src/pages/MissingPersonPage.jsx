import React from "react";
import { useAppContext } from "../Context/AppContext";
import MissingPersonForm from "../components/forms/MissingPersonForm";
import MissingPersonsDesk from "../components/dashboard/MissingPersonsDesk";

const MissingPersonPage = ({ darkMode }) => {
  const { role } = useAppContext();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ color: darkMode ? "#ededed" : "#1e293b" }}
        >
          {role === "user" ? "Report Missing Person 📢" : "Missing Persons Desk 📋"}
        </h1>
        <p
          className="mt-1"
          style={{ color: darkMode ? "#8a8a8a" : "#64748b" }}
        >
          {role === "user" && "Submit a report to help emergency responders find your loved ones."}
          {role !== "user" && "Review active missing person cases and provide field updates."}
        </p>
      </div>

      {role === "user" ? (
        <MissingPersonForm darkMode={darkMode} />
      ) : (
        <MissingPersonsDesk darkMode={darkMode} />
      )}
    </div>
  );
};

export default MissingPersonPage;
