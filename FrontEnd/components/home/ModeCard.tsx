import { useTheme } from "@/context/ThemeContext";
import { fonts, fontSize, radius, shadows, spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - spacing.xl * 2 - spacing.md) / 2;

interface ModeCardProps {
  title: string;
  description: string;
  emoji: string;
  gradient: readonly [string, string];
  onPress: () => void;
}

export default function ModeCard({
  title,
  description,
  emoji,
  gradient,
  onPress,
}: ModeCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, shadows.md]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    borderRadius: radius.xl,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: "#FFFFFF",
    lineHeight: 26,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 16,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  arrowText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: fonts.bodyBold,
  },
});
