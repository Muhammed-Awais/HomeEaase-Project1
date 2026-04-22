import { colors, fonts, radius, shadows, spacing } from "@/constants/theme";
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts,
} from "@expo-google-fonts/outfit";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { CheckCircle, AlertCircle } from "lucide-react-native";
import { useEffect } from "react";
import { View, Text } from "react-native";
import Toast, { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { SearchProvider } from "../context/SearchContext";

SplashScreen.preventAutoHideAsync();

// ─── Custom Toast Configuration ─────────────────────────────────────────────
const createToastConfig = (colors: any): ToastConfig => ({
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.success,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        height: 70,
        width: "90%",
        marginTop: spacing.base,
        ...shadows.md,
      }}
      contentContainerStyle={{ paddingHorizontal: spacing.base }}
      text1Style={{
        fontFamily: fonts.bodyBold,
        fontSize: 15,
        color: colors.text,
      }}
      text2Style={{
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textSecondary,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            justifyContent: "center",
            paddingLeft: spacing.base,
          }}
        >
          <CheckCircle size={24} color={colors.success} strokeWidth={2.5} />
        </View>
      )}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: colors.danger,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        height: 70,
        width: "90%",
        marginTop: spacing.base,
        ...shadows.md,
      }}
      contentContainerStyle={{ paddingHorizontal: spacing.base }}
      text1Style={{
        fontFamily: fonts.bodyBold,
        fontSize: 15,
        color: colors.text,
      }}
      text2Style={{
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textSecondary,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            justifyContent: "center",
            paddingLeft: spacing.base,
          }}
        >
          <AlertCircle size={24} color={colors.danger} strokeWidth={2.5} />
        </View>
      )}
    />
  ),
});

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// This component listens to auth state and redirects accordingly.
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!user && !inAuthGroup) {
      // Not logged in → send to welcome/auth
      router.replace("/(auth)/welcome");
    } else if (user && inAuthGroup) {
      // Logged in → send to app
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  return <>{children}</>;
}

// ─── Theme Aware App ──────────────────────────────────────────────────────────
function ThemeAwareApp() {
  const { colors, isDark } = useTheme();
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="property/[id]"
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="search"
          options={{ animation: "fade", presentation: "modal" }}
        />
        <Stack.Screen
          name="post-property"
          options={{ animation: "slide_from_bottom", presentation: "modal" }}
        />
      </Stack>
      <Toast config={createToastConfig(colors)} topOffset={60} />
    </>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <AuthGuard>
            <ThemeAwareApp />
          </AuthGuard>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
