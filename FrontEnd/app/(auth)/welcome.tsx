import { fonts, fontSize, spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View, Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthButton from "@/components/auth/AuthButton";
import WelcomeHero from "@/components/auth/WelcomeHero";
import { useTheme } from "@/context/ThemeContext";

const { height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const buttonsY = useSharedValue(40);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    buttonsY.value = withDelay(
      800,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
    buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 700 }));
  }, []);

  const buttonsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonsY.value }],
    opacity: buttonsOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroSection}>
        <WelcomeHero />
      </View>

      <Animated.View style={[styles.bottomSection, buttonsStyle]}>
        <AuthButton
          title="Get Started"
          onPress={() => router.push("/(auth)/signup")}
        />
        <AuthButton
          title="I already have an account"
          variant="secondary"
          onPress={() => router.push("/(auth)/login")}
          style={{ marginTop: spacing.md }}
        />
        <View style={styles.taglineContainer}>
          <Text>
            <Text style={styles.terms}>Smart Living, Powered by </Text>
            <Text style={styles.highlightA}>A</Text>
            <Text style={styles.darkA}>&A</Text>
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["2xl"],
  },
  taglineContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  terms: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    textAlign: "center",
  },
  highlightA: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
    color: colors.accent, // Warm accent color for the first A
  },
  darkA: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
