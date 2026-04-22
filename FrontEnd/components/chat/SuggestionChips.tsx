import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export default function SuggestionChips({
  suggestions,
  onSelect,
}: SuggestionChipsProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {suggestions.map((suggestion) => (
        <TouchableOpacity
          key={suggestion}
          style={styles.chip}
          onPress={() => onSelect(suggestion)}
          activeOpacity={0.8}
        >
          <Text style={styles.text}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.accentDark,
  },
});
