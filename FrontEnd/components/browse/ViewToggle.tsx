import { radius, spacing } from "@/constants/theme";
import { LayoutGrid, List } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface ViewToggleProps {
  mode: "grid" | "list";
  onToggle: (mode: "grid" | "list") => void;
}

export default function ViewToggle({ mode, onToggle }: ViewToggleProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, mode === "grid" && styles.active]}
        onPress={() => onToggle("grid")}
      >
        <LayoutGrid
          size={16}
          color={mode === "grid" ? colors.accent : colors.textTertiary}
          strokeWidth={1.8}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, mode === "list" && styles.active]}
        onPress={() => onToggle("list")}
      >
        <List
          size={16}
          color={mode === "list" ? colors.accent : colors.textTertiary}
          strokeWidth={1.8}
        />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  button: {
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    backgroundColor: colors.accentLight,
  },
});
