import React, { useState } from "react";

const VerifyReports = ({ws}) => {
  const [message, setMessage] = useState("")
  const userId = localStorage.getItem("userId");
  const handleAction = (action) => {
    if(message == ""){
      alert("Type some message");
      return;
    }
    if (action === "accept") {
      ws.send(JSON.stringify({
        userId: userId,
        type: "Message",
        userType: "Official",
        isAuthenticated: true,
        content: message
      }))
    } else {
      ws.send(JSON.stringify({
        userId: userId,
        type: "Message",
        userType: "Official",
        isAuthenticated: false,
        content: message
      }))
    }
    
      alert("Sent to admins ✅")
  };

  return (
    <div className="grid gap-4">
        <div
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
        >
          <div className="space-y-2 mb-4">
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-32">
                Description:
              </span>
              <input onChange={(e)=>{setMessage(e.target.value)}} className="w-3xl border-2 rounded p-1" type="text" placeholder="Provide detailed information about the emergency and recommended actions.."/>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleAction("accept")}
              className="flex-1 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
            >
              ✓ Verify & Deploy
            </button>
            <button
              onClick={() => handleAction("reject")}
              className="flex-1 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              ✗ Reject
            </button>
          </div>
        </div>
    </div>
  );
};

export default VerifyReports;
