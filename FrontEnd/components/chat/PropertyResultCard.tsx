import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import { Property } from "@/constants/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BedDouble, MapPin, Heart } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface PropertyResultCardProps {
  property: any; // Allow any to handle MongoDB objects
}

export default function PropertyResultCard({
  property,
}: PropertyResultCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { user, handleToggleFavorite } = useAuth();

  const propertyId = property._id || property.id;
  const isFavorited = user?.favorites?.includes(propertyId);

  const onFavoritePress = (e: any) => {
    e.stopPropagation();
    handleToggleFavorite(propertyId);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/property/${propertyId}`)}
    >
      <Image
        source={{ uri: property.images[0] }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {property.title}
          </Text>
          <TouchableOpacity onPress={onFavoritePress} hitSlop={10}>
            <Heart 
              size={18} 
              color={isFavorited ? colors.danger : colors.textTertiary} 
              fill={isFavorited ? colors.danger : "transparent"}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>
          {property.currency || "PKR"} {property.price.toLocaleString()}/mo
        </Text>
        <View style={styles.metaRow}>
          <MapPin size={10} color={colors.textSecondary} strokeWidth={1.8} />
          <Text style={styles.metaText}>{property.city}</Text>
          <BedDouble size={10} color={colors.textSecondary} strokeWidth={1.8} />
          <Text style={styles.metaText}>{property.bedrooms} bed</Text>
        </View>
        <Text style={styles.viewText}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    overflow: "hidden",
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  image: {
    width: 80,
    height: 90,
  },
  info: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  price: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
    marginRight: 6,
  },
  viewText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.accent,
    marginTop: 4,
  },
});
