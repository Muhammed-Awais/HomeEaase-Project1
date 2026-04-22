import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import {
  ArrowUpFromLine,
  Bath,
  BedDouble,
  Car,
  Dumbbell,
  Maximize,
  ShieldCheck,
  TreePine,
  Utensils,
  Waves,
  Wifi,
  Wind,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const iconMap: Record<string, any> = {
  WiFi: Wifi,
  Parking: Car,
  AC: Wind,
  Kitchen: Utensils,
  Security: ShieldCheck,
  Garden: TreePine,
  Pool: Waves,
  Gym: Dumbbell,
  Elevator: ArrowUpFromLine,
};

interface AmenitiesGridProps {
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
}

export default function AmenitiesGrid({
  amenities,
  bedrooms,
  bathrooms,
  area,
  areaUnit,
}: AmenitiesGridProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Details & Amenities</Text>
      <View style={styles.mainStats}>
        <View style={styles.stat}>
          <BedDouble size={20} color={colors.accent} strokeWidth={1.5} />
          <Text style={styles.statValue}>{bedrooms}</Text>
          <Text style={styles.statLabel}>Bedrooms</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Bath size={20} color={colors.accent} strokeWidth={1.5} />
          <Text style={styles.statValue}>{bathrooms}</Text>
          <Text style={styles.statLabel}>Bathrooms</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Maximize size={20} color={colors.accent} strokeWidth={1.5} />
          <Text style={styles.statValue}>{area}</Text>
          <Text style={styles.statLabel}>{areaUnit}</Text>
        </View>
      </View>
      <View style={styles.amenitiesGrid}>
        {amenities.map((amenity) => {
          const Icon = iconMap[amenity];
          return (
            <View key={amenity} style={styles.amenityChip}>
              {Icon && (
                <Icon size={14} color={colors.accent} strokeWidth={1.8} />
              )}
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.base,
  },
  mainStats: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.accentLight,
  },
  amenityText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.accentDark,
  },
});
