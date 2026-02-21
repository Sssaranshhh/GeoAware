import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const AppLayout = ({ darkMode, setDarkMode }) => {
  return (
    <div className="flex gap-4 p-4" style={{ backgroundColor: darkMode ? "#191919" : "#ffffff" }}>
      <Sidebar darkMode={darkMode} />
      <div className="flex-1 flex flex-col gap-4">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <main
          className="rounded-2xl shadow-lg border p-8 overflow-auto"
          style={{
            backgroundColor: darkMode ? "#202020" : "#ffffff",
            color: darkMode ? "#ededed" : "#000000",
            borderColor: darkMode ? "#2f2f2f" : "#e2e8f0",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
