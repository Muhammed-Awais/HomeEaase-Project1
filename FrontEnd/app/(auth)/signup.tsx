import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { ArrowLeft, MapPin } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AuthButton from "@/components/auth/AuthButton";
import AuthInput from "@/components/auth/AuthInput";
import { useTheme } from "@/context/ThemeContext";

const PAKISTAN_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Hyderabad", "Sialkot",
  "Gujranwala", "Bahawalpur", "Sargodha", "Abbottabad", "Sukkur",
];

export default function SignupScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"renter" | "landlord">("renter");
  const [city, setCity] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !contactNo.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields.",
      });
      return;
    }
    if (role === "renter" && !city.trim()) {
      Toast.show({
        type: "error",
        text1: "City Required",
        text2: "Please select your city to receive property alerts.",
      });
      return;
    }
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password must be at least 6 characters.",
      });
      return;
    }
    const success = await signup(
      name.trim(),
      email.trim(),
      password,
      contactNo.trim(),
      role,
      role === "renter" ? city.trim() : undefined
    );
    if (success) {
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email: email.trim() },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={colors.text} strokeWidth={1.8} />
          </TouchableOpacity>

          <Text style={styles.title}>Create{"\n"}account</Text>
          <Text style={styles.subtitle}>
            Join thousands finding their dream home
          </Text>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a</Text>
            <View style={styles.rolePills}>
              <TouchableOpacity
                style={[styles.rolePill, role === "renter" && styles.rolePillActive]}
                onPress={() => {
                  setRole("renter");
                  setCity("");
                }}
              >
                <Text
                  style={[styles.rolePillText, role === "renter" && styles.rolePillTextActive]}
                >
                  🔍 Renter
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rolePill, role === "landlord" && styles.rolePillActive]}
                onPress={() => {
                  setRole("landlord");
                  setCity("");
                }}
              >
                <Text
                  style={[styles.rolePillText, role === "landlord" && styles.rolePillTextActive]}
                >
                  🏠 Landlord
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Full Name"
              placeholder="Your full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <AuthInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AuthInput
              label="Contact Number"
              placeholder="Your phone number"
              value={contactNo}
              onChangeText={setContactNo}
              keyboardType="phone-pad"
            />
            <AuthInput
              label="Password"
              placeholder="Create a strong password (min. 6 chars)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* City Selector — renters only */}
            {role === "renter" && (
              <View style={styles.cityContainer}>
                <Text style={styles.cityLabel}>Your City</Text>
                <Text style={styles.cityHint}>
                  🔔 You'll get alerts when new properties are listed in your city
                </Text>
                <TouchableOpacity
                  style={[styles.citySelector, showCityDropdown && styles.citySelectorActive]}
                  onPress={() => setShowCityDropdown(!showCityDropdown)}
                  activeOpacity={0.8}
                >
                  <MapPin size={16} color={city ? colors.accent : colors.textTertiary} strokeWidth={1.8} />
                  <Text style={[styles.citySelectorText, !city && styles.citySelectorPlaceholder]}>
                    {city || "Select your city"}
                  </Text>
                  <Text style={styles.dropdownArrow}>{showCityDropdown ? "▲" : "▼"}</Text>
                </TouchableOpacity>

                {showCityDropdown && (
                  <View style={[styles.dropdown, { backgroundColor: colors.surface }]}>
                    <ScrollView
                      style={{ maxHeight: 200 }}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <TouchableOpacity
                          key={c}
                          style={[
                            styles.dropdownItem,
                            city === c && styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            setCity(c);
                            setShowCityDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              city === c && styles.dropdownItemTextActive,
                            ]}
                          >
                            {c}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={colors.accent}
                style={{ marginVertical: 16 }}
              />
            ) : (
              <AuthButton title="Create Account" onPress={handleSignup} />
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
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
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize["3xl"],
    color: colors.text,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  roleContainer: {
    marginBottom: spacing.xl,
  },
  roleLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  rolePills: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  rolePillActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  rolePillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  rolePillTextActive: {
    color: colors.accentDark,
  },
  form: {},
  // ── City Selector ────────────────────────────────────────────────────────
  cityContainer: {
    marginBottom: spacing.lg,
  },
  cityLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  cityHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.accent,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  citySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  citySelectorActive: {
    borderColor: colors.accent,
  },
  citySelectorText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
  },
  citySelectorPlaceholder: {
    color: colors.textTertiary,
  },
  dropdownArrow: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  dropdown: {
    marginTop: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingHorizontal: spacing.base,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: colors.accentLight,
  },
  dropdownItemText: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
  },
  dropdownItemTextActive: {
    color: colors.accent,
    fontFamily: fonts.bodySemiBold,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing["2xl"],
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  footerLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
});
