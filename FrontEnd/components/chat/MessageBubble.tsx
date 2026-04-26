import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Circle, CheckCircle2 } from "lucide-react-native";

interface MessageBubbleProps {
  text: string;
  sender: "user" | "bot";
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onTap?: () => void;
  onLongPress?: () => void;
}

export default function MessageBubble({ 
  text, 
  sender, 
  isSelectionMode, 
  isSelected, 
  onTap, 
  onLongPress 
}: MessageBubbleProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, isSelected);
  const isBot = sender === "bot";

  return (
    <TouchableOpacity
      activeOpacity={isSelectionMode ? 0.7 : 1}
      onPress={onTap}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={[
        styles.row, 
        isBot ? styles.rowBot : styles.rowUser,
        isSelected && styles.rowSelected
      ]}
    >
      {isSelectionMode && (
        <View style={styles.selectionIndicator}>
          {isSelected ? (
            <CheckCircle2 size={20} color={colors.accent} fill={colors.accentLight} />
          ) : (
            <Circle size={20} color={colors.textTertiary} />
          )}
        </View>
      )}

      <View style={styles.messageContent}>
        {isBot && (
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
        )}
        <View
          style={[
            styles.bubble, 
            isBot ? styles.bubbleBot : styles.bubbleUser,
            isSelected && styles.bubbleSelected
          ]}
        >
          <Text style={[styles.text, isBot ? styles.textBot : styles.textUser]}>
            {text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any, isSelected: boolean = false) => StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  rowBot: {
    justifyContent: "flex-start",
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowSelected: {
    backgroundColor: colors.accent + '10', // 10% opacity version of accent
  },
  selectionIndicator: {
    marginRight: spacing.xs,
  },
  messageContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    maxWidth: "85%",
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  botAvatarText: {
    fontSize: 14,
  },
  bubble: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleBot: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.text,
    borderBottomRightRadius: 4,
  },
  bubbleSelected: {
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    lineHeight: 21,
  },
  textBot: {
    color: colors.text,
  },
  textUser: {
    color: colors.background,
  },
});
