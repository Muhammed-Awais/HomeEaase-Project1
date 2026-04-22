import {
  fonts,
  fontSize,
  radius,
  shadows,
  spacing,
} from "@/constants/theme";
import { Image } from "expo-image";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");
const ITEM_W = (width - spacing.xl * 2 - spacing.md) / 2;

const MOCK_RESULTS = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
];

interface ResultGalleryProps {
  isGenerating?: boolean;
}

export default function ResultGallery({ isGenerating }: ResultGalleryProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (isGenerating) {
    return (
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.card, styles.skeletonCard]}>
            <View style={styles.skeletonInner} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {MOCK_RESULTS.map((url, index) => (
        <View key={index} style={[styles.card, shadows.sm]}>
          <Image
            source={{ uri: url }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Premium Style {index + 1}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    width: ITEM_W,
    height: ITEM_W,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  skeletonCard: {
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  skeletonInner: {
    flex: 1,
    backgroundColor: colors.accentLight,
    opacity: 0.3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  overlayText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: "#FFFFFF",
  },
});
