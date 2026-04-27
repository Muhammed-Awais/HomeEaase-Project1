import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Replace this IP with your computer's local WiFi IP address.
// On Windows: open cmd and run `ipconfig`, look for "IPv4 Address"
// under your Wi-Fi adapter (NOT VirtualBox/Hyper-V adapters).
//
// Current IP: 192.168.18.152  (run `ipconfig` again if your IP changes)
// ─────────────────────────────────────────────────────────────────────────────
export const BASE_URL = "http://192.168.0.105:5000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000, // 15 seconds — generous for mobile networks
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — automatically attach JWT token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle global errors (e.g. 401 Unauthorized, network failures)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized — clear stale auth
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("authToken");
    }

    // Enhance network error messages for debugging
    if (!error.response) {
      console.error(
        "🔴 Network Error — No response received from server.\n" +
          `   URL: ${error.config?.baseURL}${error.config?.url}\n` +
          `   Possible causes:\n` +
          `   1. Backend server is not running on port 5000\n` +
          `   2. IP address ${BASE_URL} is wrong (run ipconfig to check)\n` +
          `   3. Phone and PC are on different WiFi networks\n` +
          `   4. Windows Firewall is blocking port 5000`
      );
    }

    return Promise.reject(error);
  }
);

// ─── Utility: Check if backend is reachable ──────────────────────────────────
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(BASE_URL, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

// Password Reset Handlers
export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email });

export const verifyResetCode = (email: string, otp: string) =>
  api.post("/auth/verify-reset-code", { email, otp });

export const resetPassword = (data: any) =>
  api.post("/auth/reset-password", data);

// User Profile Handlers
export const updateProfile = (data: FormData) =>
  api.put("/users/profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
    transformRequest: (d) => d, // Prevent stringifying FormData
  });

export const deleteAccount = () => api.delete("/users/profile");

// Favorites Handlers
export const toggleFavorite = (propertyId: string) =>
  api.post(`/users/favorites/${propertyId}`);

export const getFavorites = () => api.get("/users/favorites");

// Property Listings Management
export const updateProperty = (id: string, formData: FormData) =>
  api.put(`/properties/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    transformRequest: (data) => data,
  });

export const deleteProperty = (id: string) => api.delete(`/properties/${id}`);

export default api;
