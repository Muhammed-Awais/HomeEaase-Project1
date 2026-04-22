import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";
import PropertyResultCard from "@/components/chat/PropertyResultCard";
import SuggestionChips from "@/components/chat/SuggestionChips";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { SUGGESTION_CHIPS } from "@/constants/mockData";
import { fonts, fontSize, spacing } from "@/constants/theme";
import { Message } from "@/constants/types";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { sendChatMessage, ChatHistoryMessage } from "@/services/chatApi";
import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  text: "Hello! I'm HomeEase AI. I can help you find properties to rent or buy across Pakistan. What are you looking for?",
  sender: "bot",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [conversationHistory, setConversationHistory] = useState<ChatHistoryMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const historyWithUser: ChatHistoryMessage[] = [
      ...conversationHistory,
      { role: "user", content: text },
    ];

    try {
      const data = await sendChatMessage(text, conversationHistory, user?.id);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        listings: data.listings?.length > 0 ? data.listings : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
      setConversationHistory([
        ...historyWithUser,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error: any) {
      const errorText =
        error?.response?.status === 429
          ? "Too many requests. Please wait a moment and try again."
          : "Sorry, something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: errorText,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (text: string) => {
    handleSend(text);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View>
      <MessageBubble text={item.text} sender={item.sender} />
      {item.listings?.map((property, index) => (
        <PropertyResultCard
          key={property._id || property.id || String(index)}
          property={property}
        />
      ))}
      {item.property && <PropertyResultCard property={item.property} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.botEmoji}>🤖</Text>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>Always ready to help</Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        <SuggestionChips
          suggestions={SUGGESTION_CHIPS}
          onSelect={handleSuggestion}
        />
        <ChatInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.surface,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    botEmoji: {
      fontSize: 28,
    },
    headerTitle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.md,
      color: colors.text,
    },
    headerSubtitle: {
      fontFamily: fonts.body,
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    onlineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.success,
    },
    messageList: {
      paddingVertical: spacing.base,
    },
  });
