import api from "./api";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export const sendChatMessage = async (
  message: string,
  conversationHistory: ChatHistoryMessage[] = [],
  userId?: string
): Promise<{ success: boolean; reply: string; listings: any[]; filters: Record<string, any> }> => {
  const response = await api.post("/chat", {
    message,
    userId,
    conversationHistory,
  }, { timeout: 60000 }); // 60s — LLM calls can take time
  return response.data;
};

export const getChatHistory = async (userId: string) => {
  const response = await api.get(`/chat/history/${userId}`);
  return response.data;
};

export const clearChatHistory = async (userId: string) => {
  const response = await api.delete(`/chat/history/${userId}`);
  return response.data;
};
