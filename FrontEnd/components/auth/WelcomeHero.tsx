import { fonts, fontSize, spacing } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function WelcomeHero() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 600 });

    titleY.value = withDelay(
      300,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 700 }));

    subtitleY.value = withDelay(
      550,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
    subtitleOpacity.value = withDelay(550, withTiming(1, { duration: 700 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subtitleY.value }],
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.logoInner}>
          <Text style={styles.logoEmoji}>🏠</Text>
        </View>
        <View style={styles.aiDot}>
          <Text style={styles.aiDotText}>AI</Text>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.title, titleStyle]}>
        Smart Rent{"\n"}& Decor
      </Animated.Text>

      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        Find your perfect home or reimagine{"\n"}your space — powered by AI
      </Animated.Text>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: spacing["3xl"],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 32,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing["2xl"],
  },
  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: 36,
  },
  aiDot: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.text,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  aiDotText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.background,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize["3xl"],
    color: colors.text,
    textAlign: "center",
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginTop: spacing.base,
  },
});
