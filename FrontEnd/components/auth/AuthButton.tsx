import { useTheme } from "@/context/ThemeContext";
import { fonts, fontSize, radius } from "@/constants/theme";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  style?: ViewStyle;
}

export default function AuthButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  style,
}: AuthButtonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.accent} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary ? styles.primaryText : styles.secondaryText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  button: {
    height: 54,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  text: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    letterSpacing: 0.4,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: colors.text,
  },
});
