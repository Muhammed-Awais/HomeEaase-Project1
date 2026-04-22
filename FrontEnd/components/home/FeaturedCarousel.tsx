import { useTheme } from "@/context/ThemeContext";
import { fonts, fontSize, radius, shadows, spacing } from "@/constants/theme";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import { BedDouble, MapPin } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import api from "@/services/api";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.75; // Increased width for better visibility

export default function FeaturedCarousel() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatured = useCallback(async () => {
    try {
      const response = await api.get("/properties/featured");
      if (response.data.success) {
        setFeatured(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching featured properties:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFeatured();
    }, [fetchFeatured])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }

  if (featured.length === 0) {
    return null; // Don't show the featured section if it's empty
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Featured</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_W + spacing.md}
      >
        {featured.map((property) => (
          <TouchableOpacity
            key={property._id || property.id}
            style={[styles.card, shadows.md]}
            activeOpacity={0.9}
            onPress={() => router.push(`/property/${property._id || property.id}`)}
          >
            <Image
              source={{ uri: property.images[0] }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>
                {property.currency || "PKR"} {property.price.toLocaleString()}
              </Text>
              <Text style={styles.priceUnit}>/mo</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>
                {property.title}
              </Text>
              <View style={styles.metaRow}>
                <MapPin
                  size={12}
                  color={colors.textSecondary}
                  strokeWidth={1.8}
                />
                <Text style={styles.metaText} numberOfLines={1}>
                  {property.location || property.city}
                </Text>
                <View style={styles.dot} />
                <BedDouble
                  size={12}
                  color={colors.textSecondary}
                  strokeWidth={1.8}
                />
                <Text style={styles.metaText}>{property.bedrooms} bed</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginTop: spacing["2xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  seeAll: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    width: CARD_W,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: CARD_W * 0.65,
  },
  priceTag: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  priceText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: "#FFFFFF",
  },
  priceUnit: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.7)",
    marginLeft: 2,
  },
  info: {
    padding: spacing.md,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: 4,
  },
  center: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
});
