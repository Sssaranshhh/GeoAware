import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  return (
    <div className="flex gap-4 p-4">
      <Sidebar />
      <div className="flex-1 flex flex-col gap-4">
        <Header />
        <main className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
