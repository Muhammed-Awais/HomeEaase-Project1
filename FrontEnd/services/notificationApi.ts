import api from "./api";
import { Notification } from "@/constants/types";

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get("/notifications");
  return response.data.data || [];
};

export const markAllRead = async (): Promise<void> => {
  await api.put("/notifications/read-all");
};

export const markOneRead = async (id: string): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

export const clearAllNotifications = async (): Promise<void> => {
  await api.delete("/notifications/clear-all");
};
