import { colors as staticColors, fonts, fontSize, radius, spacing } from "@/constants/theme";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Monitor, Moon, Sun } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, setTheme, colors } = useTheme();
  const styles = createStyles(colors);

  const ModeOption = ({ title, icon: Icon, value }: { title: string; icon: any; value: ThemeMode }) => (
    <TouchableOpacity 
      style={[
        styles.optionRow, 
        mode === value && styles.optionRowActive
      ]} 
      onPress={() => setTheme(value)}
    >
      <View style={styles.optionLeft}>
        <Icon size={20} color={mode === value ? colors.accent : colors.textSecondary} />
        <Text style={[styles.optionText, mode === value && styles.optionTextActive]}>{title}</Text>
      </View>
      {mode === value && (
        <Check size={20} color={colors.accent} strokeWidth={2.5} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.card}>
          <ModeOption title="System Default" icon={Monitor} value="system" />
          <View style={styles.divider} />
          <ModeOption title="Light Mode" icon={Sun} value="light" />
          <View style={styles.divider} />
          <ModeOption title="Dark Mode" icon={Moon} value="dark" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof staticColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  content: {
    padding: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.base,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  optionRowActive: {
    backgroundColor: colors.accentLight + "40",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  optionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.accent,
    fontFamily: fonts.bodySemiBold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.base + 20 + spacing.md,
  },
});
