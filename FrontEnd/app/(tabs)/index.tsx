import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import GreetingHeader from "@/components/home/GreetingHeader";
import ModeCard from "@/components/home/ModeCard";
import QuickStats from "@/components/home/QuickStats";
import { spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Data in FeaturedCarousel will be refreshed because it uses useFocusEffect 
    // but we can also trigger other things here if needed.
    // To keep it simple, we just set refreshing back to false after a delay 
    // or let child components handle it.
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.accent} 
          />
        }
      >
        <GreetingHeader />

        <View style={styles.modeCards}>
          <ModeCard
            title="Chat with AI"
            description="Let our AI find your perfect match"
            emoji="🤖"
            gradient={["#1A1A1A", "#3D3D3D"] as const}
            onPress={() => router.push("/(tabs)/chat")}
          />
          <ModeCard
            title="Browse Listings"
            description="Explore properties at your own pace"
            emoji="🏘️"
            gradient={["#C8965D", "#A87B4A"] as const}
            onPress={() => router.push("/(tabs)/browse")}
          />
        </View>

        <QuickStats />
        <FeaturedCarousel />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modeCards: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  bottomPadding: {
    height: spacing["3xl"],
  },
});
