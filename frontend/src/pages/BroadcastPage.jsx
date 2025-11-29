import React from "react";
import BroadcastForm from "../components/forms/BroadcastForm";

const BroadcastPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Broadcast Emergency Alert 📢
        </h2>
        <p className="text-slate-600 text-sm">
          Send warnings to all users in the affected region.
        </p>
      </div>

      <BroadcastForm />
    </div>
  );
};

export default BroadcastPage;
