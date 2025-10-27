import api from "./api";

// Signup API call
export const signup = async (userData) => {
  try {
    const response = await api.post("/signup", {
      username: userData.fullname,
      email: userData.email,
      password: userData.password,
      userType: userData.userType, // 'User', 'Admin', 'Official'
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Signup failed. Please try again." }
    );
  }
};

// Signin API call
export const signin = async (credentials) => {
  try {
    const response = await api.post("/signin", {
      email: credentials.email,
      password: credentials.password,
    });

    // Store token and userId in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
    }

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Login failed. Please check your credentials.",
      }
    );
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Get stored token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Get stored userId
export const getUserId = () => {
  return localStorage.getItem("userId");
};

// Decode JWT token to get user info
export const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};
