import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, KeyRound } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AuthButton from "@/components/auth/AuthButton";
import { verifyResetCode, forgotPassword } from "@/services/api";
import { useTheme } from "@/context/ThemeContext";

export default function VerifyResetCodeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: "Please enter the 6-digit code sent to your email.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyResetCode(email, otp);
      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Code Verified",
          text2: "You can now set a new password.",
        });
        router.push({
          pathname: "/(auth)/reset-password",
          params: { email, otp },
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error.response?.data?.message || "Invalid or expired code.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await forgotPassword(email);
      Toast.show({
        type: "success",
        text1: "Code Resent",
        text2: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Resend Failed",
        text2: "Could not resend code. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={colors.text} strokeWidth={1.8} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <KeyRound size={32} color={colors.accent} strokeWidth={1.5} />
          </View>

          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              placeholder="000000"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={colors.accent}
                style={{ marginVertical: 16 }}
              />
            ) : (
              <AuthButton title="Verify Code" onPress={handleVerify} />
            )}

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                {isResending ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text style={styles.resendLink}>Resend Code</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing["3xl"],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing["2xl"],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize["3xl"],
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing["2xl"],
    lineHeight: 24,
  },
  emailText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
  },
  form: {
    marginTop: spacing.md,
  },
  otpInput: {
    height: 60,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    fontSize: 24,
    fontFamily: fonts.bodySemiBold,
    textAlign: "center",
    marginBottom: spacing.xl,
    letterSpacing: 8,
    color: colors.text,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  resendText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  resendLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
});
