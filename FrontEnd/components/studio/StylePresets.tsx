import { useTheme } from "@/context/ThemeContext";
import { STYLE_PRESETS } from "@/constants/mockData";
import {
  fonts,
  fontSize,
  radius,
  shadows,
  spacing,
} from "@/constants/theme";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface StylePresetsProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function StylePresets({
  selected,
  onSelect,
}: StylePresetsProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View>
      <Text style={styles.sectionTitle}>Choose a Style</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STYLE_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.card,
              shadows.sm,
              selected === preset.id && styles.cardActive,
            ]}
            onPress={() => onSelect(preset.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.emoji}>{preset.emoji}</Text>
            <Text style={styles.name}>{preset.name}</Text>
            <Text style={styles.desc}>{preset.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    width: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  cardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  emoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
});
