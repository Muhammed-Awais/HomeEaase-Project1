import { fonts, fontSize, spacing } from "@/constants/theme";
import { Notification } from "@/constants/types";
import { Home, MessageCircle, Settings, Trash2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  onDelete?: () => void;
}

const typeIcons = {
  property: Home,
  message: MessageCircle,
  system: Settings,
};

export default function NotificationItem({
  notification,
  onPress,
  onDelete,
}: NotificationItemProps) {
  const { colors } = useTheme();

  const typeColors: Record<string, string> = {
    property: "#4CAF7D",
    message: "#4A90D9",
    system: colors.accent,
  };

  const styles = createStyles(colors);
  const Icon = typeIcons[notification.type] || Settings;
  const iconColor = typeColors[notification.type] || colors.accent;

  return (
    <TouchableOpacity
      style={[styles.container, !notification.read && styles.unread]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconColor + "18" }]}>
        <Icon size={18} color={iconColor} strokeWidth={1.8} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.read && <View style={styles.dot} />}
        </View>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={styles.timestamp}>
          {notification.timestamp || ""}
        </Text>
      </View>

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={15} color={colors.textTertiary} strokeWidth={1.6} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.base,
      gap: spacing.md,
      backgroundColor: colors.surface,
      alignItems: "flex-start",
    },
    unread: {
      backgroundColor: colors.accentLight + "55",
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    content: {
      flex: 1,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    title: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.base,
      color: colors.text,
      flex: 1,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
      flexShrink: 0,
    },
    body: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 18,
    },
    timestamp: {
      fontFamily: fonts.body,
      fontSize: fontSize.xs,
      color: colors.textTertiary,
      marginTop: 4,
    },
    deleteBtn: {
      paddingTop: 2,
      paddingLeft: spacing.sm,
      flexShrink: 0,
    },
  });
