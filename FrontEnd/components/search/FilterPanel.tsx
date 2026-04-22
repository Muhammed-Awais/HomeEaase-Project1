import { AMENITIES_LIST } from "@/constants/mockData";
import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface FilterPanelProps {
  selectedAmenities: string[];
  onToggleAmenity: (amenity: string) => void;
  bedrooms: string;
  onSetBedrooms: (val: string) => void;
  minPrice: string;
  onMinPriceChange: (val: string) => void;
  maxPrice: string;
  onMaxPriceChange: (val: string) => void;
}

export default function FilterPanel({
  selectedAmenities,
  onToggleAmenity,
  bedrooms,
  onSetBedrooms,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
}: FilterPanelProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bedrooms</Text>
      <View style={styles.bedroomRow}>
        {["Any", "1", "2", "3", "4+"].map((value) => {
          const isSelected = bedrooms === value;
          return (
            <TouchableOpacity 
              key={value} 
              style={[
                styles.bedroomChip,
                isSelected && styles.bedroomChipActive
              ]}
              onPress={() => onSetBedrooms(value)}
            >
              <Text style={[
                styles.bedroomText,
                isSelected && styles.bedroomTextActive
              ]}>{value}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Price Range (PKR)</Text>
      <View style={styles.priceRow}>
        <View style={styles.priceInputWrap}>
          <Text style={styles.priceLabel}>Min</Text>
          <TextInput
            style={styles.priceInput}
            value={minPrice}
            onChangeText={onMinPriceChange}
            placeholder="10,000"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.priceDash} />
        <View style={styles.priceInputWrap}>
          <Text style={styles.priceLabel}>Max</Text>
          <TextInput
            style={styles.priceInput}
            value={maxPrice}
            onChangeText={onMaxPriceChange}
            placeholder="200,000"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Amenities</Text>
      <View style={styles.amenitiesGrid}>
        {AMENITIES_LIST.slice(0, 10).map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity);
          return (
            <TouchableOpacity
              key={amenity}
              style={[
                styles.amenityChip,
                isSelected && styles.amenityChipActive,
              ]}
              onPress={() => onToggleAmenity(amenity)}
            >
              <Text
                style={[
                  styles.amenityText,
                  isSelected && styles.amenityTextActive,
                ]}
              >
                {amenity}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingVertical: spacing.base,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  bedroomRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  bedroomChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  bedroomChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  bedroomText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  bedroomTextActive: {
    color: colors.background,
  },
  priceRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  priceInputWrap: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  priceLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  priceInput: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.text,
    padding: 0,
    height: 24,
  },
  priceDash: {
    width: 16,
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  amenityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  amenityChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  amenityText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  amenityTextActive: {
    color: "#FFFFFF",
  },
});
