import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Notification } from "@/constants/types";
import * as notificationApi from "@/services/notificationApi";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markOneRead: (id: string) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Format a MongoDB ISO date into a human-readable relative string.
 */
function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const raw = await notificationApi.getNotifications();
      // Normalize: add id alias and format timestamp
      const normalized = raw.map((n: any) => ({
        ...n,
        id: n._id,
        timestamp: formatTimestamp(n.createdAt),
      }));
      setNotifications(normalized);
    } catch (err) {
      console.warn("[NotificationContext] fetchNotifications failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Auto-fetch when user logs in
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn("[NotificationContext] markAllRead failed:", err);
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await notificationApi.markOneRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.warn("[NotificationContext] markOneRead failed:", err);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id && n.id !== id));
    } catch (err) {
      console.warn("[NotificationContext] removeNotification failed:", err);
    }
  };

  const clearAll = async () => {
    try {
      await notificationApi.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.warn("[NotificationContext] clearAll failed:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAllRead,
        markOneRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
