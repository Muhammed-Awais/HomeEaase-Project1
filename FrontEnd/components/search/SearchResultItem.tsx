import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import { Property } from "@/constants/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BedDouble, MapPin } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface SearchResultItemProps {
  property: Property;
}

export default function SearchResultItem({ property }: SearchResultItemProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={() => router.push(`/property/${property._id || property.id}`)}
    >
      <Image
        source={{ uri: property.images[0] }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.metaRow}>
          <MapPin size={11} color={colors.textSecondary} strokeWidth={1.8} />
          <Text style={styles.metaText}>{property.location}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>
            {property.currency} {property.price.toLocaleString()}
            <Text style={styles.perMonth}>/mo</Text>
          </Text>
          <View style={styles.bedBadge}>
            <BedDouble size={11} color={colors.accent} strokeWidth={1.8} />
            <Text style={styles.bedText}>{property.bedrooms}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  price: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  perMonth: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  bedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  bedText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.accentDark,
  },
});
