import {
  fonts,
  fontSize,
  radius,
  shadows,
  spacing,
} from "@/constants/theme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  Heart,
  Home,
  LogOut,
  Settings,
  Shield,
} from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: <Home size={22} color={colors.accent} />,
      label: "My Listings",
      onPress: () => router.push("/my-listings"),
      role: "landlord",
    },
    {
      icon: <Bell size={22} color={colors.accent} />,
      label: "Notifications",
      onPress: () => router.push("/notifications"),
    },
    {
      icon: <Heart size={22} color={colors.accent} />,
      label: "Favorites",
      onPress: () => router.push("/favorites"),
    },
    {
      icon: <Shield size={22} color={colors.accent} />,
      label: "Privacy & Security",
      onPress: () => {},
    },
    {
      icon: <Settings size={22} color={colors.accent} />,
      label: "Settings",
      onPress: () => router.push("/settings"),
    },
  ].filter((item) => !item.role || item.role === user?.role);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <Image
            source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random` }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
            <Text style={styles.userEmail}>{user?.email || "No email"}</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push("/edit-profile")}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>{item.icon}</View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <LogOut size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: spacing["4xl"] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.xl,
    ...shadows.md,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.borderLight,
  },
  profileInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  userName: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  userEmail: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  editButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentLight,
  },
  editButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.accent,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing["2xl"],
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.danger + "30",
  },
  logoutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.danger,
  },
});
