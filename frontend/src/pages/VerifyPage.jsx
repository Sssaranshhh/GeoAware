import React from "react";
import VerifyReports from "../components/forms/VerifyReports";

const VerifyPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Verify Emergency Reports
        </h1>
        <p className="text-gray-600 mt-1">
          Review and verify incoming disaster reports from the community
        </p>
      </div>
      <VerifyReports />
    </div>
  );
};

export default VerifyPage;
