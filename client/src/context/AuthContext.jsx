import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

// Sanitize raw server/token error messages into user-friendly ones
function sanitizeAuthError(message) {
  if (!message) return "Something went wrong. Please try again.";
  const lower = message.toLowerCase();
  if (
    lower.includes("token") ||
    lower.includes("jwt") ||
    lower.includes("session invalidated") ||
    lower.includes("unauthorized")
  ) {
    return "Your session has expired. Please log in again.";
  }
  return message;
}

// Safe localStorage read — prevents crash on corrupted data
function safeGetUser() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(safeGetUser);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verify auth state on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        const userData = data.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch {
        // Token invalid/expired and refresh also failed — clear everything
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Listen for forced logout from axios interceptor
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      navigate("/login", { replace: true });
    };

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, [navigate]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    const { user: userData, accessToken } = data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    toast.success("Account created successfully!");
    navigate("/", { replace: true });
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const { user: userData, accessToken } = data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    toast.success(`Welcome back, ${userData.name.split(" ")[0]}!`);
    navigate("/", { replace: true });
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      // Try protected logout first, fall back to soft logout
      await api.post("/auth/logout").catch(() => api.post("/auth/logout-soft"));
    } catch {
      // Even if both fail, clear local state
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login", { replace: true });
      toast.success("Logged out");
    }
  }, [navigate]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
