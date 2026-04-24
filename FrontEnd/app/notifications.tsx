import DateSeparator from "@/components/notifications/DateSeparator";
import NotificationItem from "@/components/notifications/NotificationItem";
import { fonts, fontSize, spacing } from "@/constants/theme";
import { Notification } from "@/constants/types";
import { useNotifications } from "@/context/NotificationContext";
import { Stack, useRouter } from "expo-router";
import { Bell, CheckCheck, ChevronLeft, Trash2 } from "lucide-react-native";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

function isToday(isoDate: string) {
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAllRead,
    markOneRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  // Split notifications into Today / Earlier groups
  const todayNotifs = notifications.filter((n) => isToday(n.createdAt));
  const earlierNotifs = notifications.filter((n) => !isToday(n.createdAt));

  // Flattened list with separator items interspersed
  type ListItem =
    | { kind: "separator"; date: string; key: string }
    | { kind: "notification"; data: Notification; key: string };

  const listData: ListItem[] = [];
  if (todayNotifs.length > 0) {
    listData.push({ kind: "separator", date: "Today", key: "sep-today" });
    todayNotifs.forEach((n) =>
      listData.push({ kind: "notification", data: n, key: n._id })
    );
  }
  if (earlierNotifs.length > 0) {
    listData.push({ kind: "separator", date: "Earlier", key: "sep-earlier" });
    earlierNotifs.forEach((n) =>
      listData.push({ kind: "notification", data: n, key: n._id })
    );
  }

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      if (!notification.read) {
        await markOneRead(notification._id);
      }
    },
    [markOneRead]
  );

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.kind === "separator") {
      return <DateSeparator date={item.date} />;
    }
    return (
      <NotificationItem
        notification={item.data}
        onPress={() => handleNotificationPress(item.data)}
        onDelete={() => removeNotification(item.data._id)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllRead}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CheckCheck size={20} color={colors.accent} strokeWidth={1.8} />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={clearAll}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={18} color={colors.danger} strokeWidth={1.8} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && notifications.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            listData.length === 0 ? styles.emptyContainer : undefined
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchNotifications}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
                <Bell size={40} color={colors.borderLight} strokeWidth={1.2} />
              </View>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                You'll be notified when new properties are listed in your city
              </Text>
            </View>
          }
        />
      )}
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
      alignItems: "center",
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.base,
      paddingBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCenter: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.base,
    },
    title: {
      fontFamily: fonts.heading,
      fontSize: fontSize.xl,
      color: colors.text,
    },
    badge: {
      backgroundColor: colors.danger,
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
    },
    badgeText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 11,
      color: "#FFFFFF",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.base,
    },
    loadingText: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
    },
    empty: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      paddingHorizontal: spacing["2xl"],
      gap: spacing.md,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    emptyTitle: {
      fontFamily: fonts.heading,
      fontSize: fontSize.lg,
      color: colors.text,
    },
    emptySubtitle: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });
