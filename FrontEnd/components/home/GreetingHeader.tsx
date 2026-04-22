import { fonts, fontSize, spacing, radius } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

export default function GreetingHeader() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const styles = createStyles(colors);

  const getInitials = (name: string) => {
    if (!name) return "H";
    return name.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.greeting}>Good afternoon 👋</Text>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>HomeEase</Text>
            <Text style={[styles.brandName, { color: colors.accent }]}> AI</Text>
          </View>
        </View>
        
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
