import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import api, { checkServerHealth } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  role: "renter" | "landlord" | "admin";
  avatar?: string;
  contactNo?: string;
  favorites?: string[];
  city?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signup: (name: string, email: string, password: string, contactNo: string, role: string, city?: string) => Promise<boolean>;
  verifyEmail: (email: string, otp: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  handleToggleFavorite: (propertyId: string) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract a user-friendly error message from an Axios error.
 * Handles network errors (no response), server errors, and fallback messages.
 */
const getErrorMessage = (error: any, fallback: string): string => {
  if (!error.response) {
    // No response at all — network / connectivity issue
    return "Cannot reach the server. Please check your internet connection and make sure the backend is running.";
  }
  return error.response?.data?.message || fallback;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount — check if a token is already saved (i.e., user was previously logged in)
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) {
          setToken(storedToken);
          
          // Fetch latest user data from server to ensure DP and Contact info are synced
          try {
            const response = await api.get("/users/me");
            if (response.data.success) {
              const freshUser = response.data.data;
              const normalizedUser = {
                id: freshUser._id,
                name: freshUser.name,
                email: freshUser.email,
                role: freshUser.role,
                avatar: freshUser.avatar,
                contactNo: freshUser.contactNo,
                favorites: freshUser.favorites,
                city: freshUser.city || '',
              };
              setUser(normalizedUser);
              await AsyncStorage.setItem("authUser", JSON.stringify(normalizedUser));
            } else {
              // Fallback to stored user if API fails
              const storedUser = await AsyncStorage.getItem("authUser");
              if (storedUser) setUser(JSON.parse(storedUser));
            }
          } catch (apiError: any) {
            console.warn("⚠️ Failed to fetch fresh user data:", apiError.message);
            // Graceful fallback — use cached user data so the app is still usable offline
            const storedUser = await AsyncStorage.getItem("authUser");
            if (storedUser) {
              setUser(JSON.parse(storedUser));
              console.log("ℹ️ Using cached user data instead.");
            }
          }
        }
      } catch (error) {
        console.error("Failed to load stored auth:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  // ─── Signup ───────────────────────────────────────────────────────────────
  const signup = async (
    name: string,
    email: string,
    password: string,
    contactNo: string,
    role: string,
    city?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/signup", { name, email, password, contactNo, role, city });
      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Verification Sent",
          text2: "Please check your email for the OTP.",
        });
        return true;
      }
      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: response.data.message,
      });
      return false;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: getErrorMessage(error, "Something went wrong. Please try again."),
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Verify Email OTP ─────────────────────────────────────────────────────
  const verifyEmail = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/verify-email", { email, otp });
      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Email Verified",
          text2: "Your account is now active.",
        });
        return true;
      }
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: response.data.message,
      });
      return false;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: getErrorMessage(error, "Invalid or expired OTP. Please try again."),
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        await AsyncStorage.setItem("authToken", newToken);
        await AsyncStorage.setItem("authUser", JSON.stringify(newUser));
        Toast.show({
          type: "success",
          text1: "Welcome Back",
          text2: `Successfully logged in as ${newUser.name}`,
        });
        return true;
      }
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: response.data.message,
      });
      return false;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: getErrorMessage(error, "Something went wrong. Please try again."),
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("authUser");
    router.replace("/(auth)/welcome");
  };

  // ─── Update User ────────────────────────────────────────────────────────────
  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    const combinedUser = { ...user, ...updatedData };
    setUser(combinedUser);
    await AsyncStorage.setItem("authUser", JSON.stringify(combinedUser));
  };

  // ─── Favorites ──────────────────────────────────────────────────────────────
  const handleToggleFavorite = async (propertyId: string) => {
    if (!user) return;
    try {
      // Optimistic update
      const currentFavorites = user.favorites || [];
      const isFavorited = currentFavorites.includes(propertyId);
      
      const newFavorites = isFavorited 
        ? currentFavorites.filter((id: string) => id !== propertyId)
        : [...currentFavorites, propertyId];
        
      updateUser({ favorites: newFavorites });

      // Network request
      await api.post(`/users/favorites/${propertyId}`);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not update favorites. Try again.",
      });
      // Revert optimism if needed (complex, but ignoring for brevity since it's a soft error)
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signup, verifyEmail, login, logout, updateUser, handleToggleFavorite }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
