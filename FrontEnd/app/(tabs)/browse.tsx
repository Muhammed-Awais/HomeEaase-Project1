import FilterChips from "@/components/browse/FilterChips";
import PropertyCard from "@/components/browse/PropertyCard";
import SearchBar from "@/components/browse/SearchBar";
import ViewToggle from "@/components/browse/ViewToggle";
import { fonts, fontSize, shadows, spacing } from "@/constants/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

export default function BrowseScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedChip, setSelectedChip] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProperties = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await api.get("/properties");
      if (response.data.success) {
        setProperties(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProperties(false);
  };

  const filteredProperties = properties.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse</Text>
        <ViewToggle mode={viewMode} onToggle={setViewMode} />
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onFilterPress={() => router.push("/search")}
        />
      </View>

      <FilterChips selected={selectedChip} onSelect={setSelectedChip} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          key={viewMode}
          numColumns={viewMode === "grid" ? 2 : 1}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <PropertyCard property={item} layout={viewMode} />
          )}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={viewMode === "grid" ? styles.row : undefined}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No properties found.</Text>
            </View>
          }
        />
      )}

      {user?.role === "landlord" && (
        <TouchableOpacity
          style={[styles.fab, shadows.lg]}
          activeOpacity={0.9}
          onPress={() => router.push("/post-property")}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  searchWrap: {
    paddingHorizontal: spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
    paddingTop: spacing.sm,
  },
  row: {
    gap: spacing.md,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textTertiary,
  },
});
