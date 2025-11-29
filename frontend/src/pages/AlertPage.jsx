import React from "react";
import AlertForm from "../components/forms/AlertForm";

const AlertPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Report a Disaster 🚨
        </h2>
        <p className="text-slate-600 text-sm">
          Provide details about the incident to help responders act quickly.
        </p>
      </div>

      <AlertForm />
    </div>
  );
};

export default AlertPage;
