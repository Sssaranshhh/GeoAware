import React from "react";
import AlertForm from "../components/forms/AlertForm";

const AlertPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Report Emergency Alert
        </h1>
        <p className="text-gray-600 mt-1">
          Help your community by reporting disasters you witness
        </p>
      </div>
      <AlertForm />
    </div>
  );
};

export default AlertPage;
