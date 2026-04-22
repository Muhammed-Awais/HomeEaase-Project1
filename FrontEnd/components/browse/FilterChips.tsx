import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const CHIPS = [
  "All",
  "1 Bed",
  "2 Bed",
  "3+ Bed",
  "Under 50k",
  "DHA",
  "Bahria",
  "Gulberg",
];

interface FilterChipsProps {
  selected: string;
  onSelect: (chip: string) => void;
}

export default function FilterChips({ selected, onSelect }: FilterChipsProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CHIPS.map((chip) => (
        <TouchableOpacity
          key={chip}
          style={[styles.chip, selected === chip && styles.chipActive]}
          onPress={() => onSelect(chip)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chipText,
              selected === chip && styles.chipTextActive,
            ]}
          >
            {chip}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: "center", // Center chips vertically in the scroll view
    paddingBottom: 23,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: 10, // Consistent vertical padding
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "flex-start", // Prevent stretching within parent
    minHeight: 40, // Ensure a minimum height for accessibility and consistency
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    includeFontPadding: false, // Prevent extra padding on Android
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
});
