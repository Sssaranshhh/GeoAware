import React, { createContext, useContext, useState, useEffect } from "react";
import {
  isAuthenticated,
  getToken,
  decodeToken,
  logout as logoutService,
} from "../services/authService";

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
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Map backend userType to frontend role
  const mapUserTypeToRole = (userType) => {
    const roleMap = {
      User: "user",
      Official: "responder",
      Admin: "admin",
    };
    return roleMap[userType] || "user";
  };

  // Map frontend role to backend userType
  const mapRoleToUserType = (role) => {
    const userTypeMap = {
      user: "User",
      responder: "Official",
      admin: "Admin",
    };
    return userTypeMap[role] || "User";
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const token = getToken();
        const decoded = decodeToken(token);

        if (decoded) {
          setIsLoggedIn(true);
          setUserId(decoded.userId);
          setRole(mapUserTypeToRole(decoded.role));
          // You can fetch user details here if needed
        } else {
          // Invalid token
          logoutService();
          setIsLoggedIn(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userRole, name, id) => {
    setRole(mapUserTypeToRole(userRole));
    setUserName(name);
    setUserId(id);
    setIsLoggedIn(true);
  };

  const logout = () => {
    logoutService();
    setIsLoggedIn(false);
    setRole("user");
    setUserName("John Doe");
    setUserId(null);
  };

  const value = {
    isLoggedIn,
    role,
    userName,
    userId,
    loading,
    login,
    logout,
    setRole,
    setUserName,
    mapRoleToUserType,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
