import { fonts, fontSize, spacing } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface DescriptionSectionProps {
  text: string;
}

export default function DescriptionSection({ text }: DescriptionSectionProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.text} numberOfLines={expanded ? undefined : 3}>
        {text}
      </Text>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={styles.toggle}>
          {expanded ? "Show less" : "Read more"}
        </Text>
      </TouchableOpacity>
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
    marginBottom: spacing.sm,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  toggle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: spacing.sm,
  },
});
