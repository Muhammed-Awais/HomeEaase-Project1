import { fonts, fontSize, spacing, radius } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Bell } from "lucide-react-native";
import { useNotifications } from "@/context/NotificationContext";

export default function GreetingHeader() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const styles = createStyles(colors);

  const getInitials = (name: string) => {
    if (!name) return "H";
    return name.charAt(0).toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning 👋";
    if (hour < 17) return "Good afternoon 👋";
    return "Good evening 👋";
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>HomeEase</Text>
            <Text style={[styles.brandName, { color: colors.accent }]}> AI</Text>
          </View>
        </View>
        
        <View style={styles.actionsRow}>
          {user?.role === "renter" && (
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => router.push("/notifications")}
              style={styles.bellContainer}
            >
              <Bell size={24} color={colors.text} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => router.push("/(tabs)/profile")}
            style={styles.avatarContainer}
          >
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatarImage} 
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{getInitials(user?.name || "")}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textCol: {},
  greeting: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandName: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl * 1.2,
    color: colors.text,
    letterSpacing: -0.5,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  bellContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: "#FFFFFF",
  },
  avatarContainer: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.md,
    color: "#FFFFFF",
  },
});
