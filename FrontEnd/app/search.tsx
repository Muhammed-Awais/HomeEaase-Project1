import FilterPanel from "@/components/search/FilterPanel";
import SearchResultItem from "@/components/search/SearchResultItem";
import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import { ArrowLeft, Search as SearchIcon, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useSearch } from "@/context/SearchContext";
import api from "@/services/api";

export default function SearchScreen() {
  const { colors } = useTheme();
  const { chatResults, lastFilters } = useSearch();
  const styles = createStyles(colors);
  const router = useRouter();
  
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [properties, setProperties] = useState<any[]>(chatResults || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter States
  const [bedrooms, setBedrooms] = useState(lastFilters?.bedrooms?.toString() || "Any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState(lastFilters?.maxPrice?.toString() || "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Update state when chat results change
  useEffect(() => {
    if (chatResults && chatResults.length > 0) {
      setProperties(chatResults);
    }
    if (lastFilters) {
      if (lastFilters.bedrooms) setBedrooms(lastFilters.bedrooms.toString());
      if (lastFilters.maxPrice) setMaxPrice(lastFilters.maxPrice.toString());
    }
  }, [chatResults, lastFilters]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (debouncedQuery) params.search = debouncedQuery;
      if (bedrooms !== "Any") params.bedrooms = bedrooms;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(",");

      const response = await api.get("/properties", { params });
      if (response.data.success) {
        setProperties(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, bedrooms, minPrice, maxPrice, selectedAmenities]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <SearchIcon
            size={16}
            color={colors.textSecondary}
            strokeWidth={1.8}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location, property..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <X size={16} color={colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      <FlatList
        data={properties}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => <SearchResultItem property={item} />}
        ListHeaderComponent={
          showFilters ? (
            <FilterPanel
              selectedAmenities={selectedAmenities}
              onToggleAmenity={toggleAmenity}
              bedrooms={bedrooms}
              onSetBedrooms={setBedrooms}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.resultCount}>
              {properties.length} properties found
            </Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No properties match your filters.</Text>
            </View>
          ) : null
        }
      />
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
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 42,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    height: "100%",
  },
  footer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  resultCount: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  loadingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textTertiary,
    textAlign: "center",
  },
});
