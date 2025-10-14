import React from "react";
import BroadcastForm from "../components/forms/BroadcastForm";

const BroadcastPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Broadcast Emergency Alert
        </h1>
        <p className="text-gray-600 mt-1">
          Send official emergency alerts to communities in affected regions
        </p>
      </div>
      <BroadcastForm />
    </div>
  );
};

export default BroadcastPage;
