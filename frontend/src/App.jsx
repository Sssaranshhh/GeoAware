// src/App.jsx
import React from "react";
import { useState } from "react";
import Auth from "./components/Auth";
import MainApp from "./components/MainApp";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("user");
  const [userName, setUserName] = useState("John Doe");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <div className="container mx-auto">
        {!isLoggedIn ? (
          <Auth role={role} setRole={setRole} setIsLoggedIn={setIsLoggedIn} setUserName={setUserName} />
        ) : (
          <MainApp role={role} userName={userName} setIsLoggedIn={setIsLoggedIn} />
        )}
      </div>
    </div>
  );
}
