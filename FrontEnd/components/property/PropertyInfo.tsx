import { fonts, fontSize, spacing } from "@/constants/theme";
import { Property } from "@/constants/types";
import { MapPin } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface PropertyInfoProps {
  property: Property;
}

export default function PropertyInfo({ property }: PropertyInfoProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{property.title}</Text>
      <View style={styles.locationRow}>
        <MapPin size={14} color={colors.textSecondary} strokeWidth={1.8} />
        <Text style={styles.location}>{property.location}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>
          {property.currency} {property.price.toLocaleString()}
        </Text>
        <Text style={styles.perMonth}>/month</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
    lineHeight: 30,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  location: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.md,
  },
  price: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize["2xl"],
    color: colors.accent,
  },
  perMonth: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
