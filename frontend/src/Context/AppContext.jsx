import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("user"); // 'user', 'responder', 'admin'
  const [userName, setUserName] = useState("John Doe");

  const login = (userRole, name) => {
    setRole(userRole);
    setUserName(name);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setRole("user");
    setUserName("John Doe");
  };

  const value = {
    isLoggedIn,
    role,
    userName,
    login,
    logout,
    setRole,
    setUserName,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
