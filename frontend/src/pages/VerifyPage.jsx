import React from "react";
import VerifyReports from "../components/forms/VerifyReports";

const VerifyPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Verify Community Reports 🕵️‍♂️
        </h2>
        <p className="text-slate-600 text-sm">
          Review and validate incoming emergency alerts.
        </p>
      </div>

      <VerifyReports />
    </div>
  );
};

export default VerifyPage;
