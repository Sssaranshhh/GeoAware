import React, { createContext, useContext, useState, useEffect } from "react";
import {
  isAuthenticated,
  getToken,
  decodeToken,
  logout as logoutService,
} from "../services/authService";

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("user");
  const [userName, setUserName] = useState("John Doe");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple mapping
  const roleMap = {
    User: "user",
    Official: "responder",
    Admin: "admin",
  };

  const userTypeMap = {
    user: "User",
    responder: "Official",
    admin: "Admin",
  };

  // ✅ On app start, check auth
  useEffect(() => {
    if (isAuthenticated()) {
      const decoded = decodeToken(getToken());
      if (decoded) {
        setIsLoggedIn(true);
        setUserId(decoded.userId);
        setRole(roleMap[decoded.role] || "user");

        // ✅ Set username from token or localStorage
        const storedName =
          decoded.username || localStorage.getItem("userName") || "User";
        setUserName(storedName);
      } else {
        logoutService();
      }
    }
    setLoading(false);
  }, []);

  const login = (userRole, name, id) => {
    setIsLoggedIn(true);
    setRole(roleMap[userRole] || "user");
    setUserName(name);
    setUserId(id);
    localStorage.setItem("userName", name);
  };

  const logout = () => {
    logoutService();
    setIsLoggedIn(false);
    setRole("user");
    setUserName("John Doe");
    setUserId(null);
    localStorage.removeItem("userName");
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        role,
        userName,
        userId,
        loading,
        login,
        logout,
        setRole,
        userTypeMap,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
