import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import { Camera, ImageIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface ImageUploaderProps {
  onUpload: () => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onUpload}
      activeOpacity={0.85}
    >
      <View style={styles.iconRow}>
        <View style={styles.iconCircle}>
          <Camera size={22} color={colors.accent} strokeWidth={1.8} />
        </View>
        <View style={styles.iconCircle}>
          <ImageIcon size={22} color={colors.accent} strokeWidth={1.8} />
        </View>
      </View>
      <Text style={styles.title}>Upload a Room Photo</Text>
      <Text style={styles.subtitle}>
        Tap to take a photo or choose from gallery
      </Text>
      <View style={styles.dashedBorder} />
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.xl,
    padding: spacing["2xl"],
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.accent + "30",
    borderStyle: "dashed",
  },
  iconRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  dashedBorder: {},
});
