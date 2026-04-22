import ImageUploader from "@/components/studio/ImageUploader";
import ResultGallery from "@/components/studio/ResultGallery";
import StylePresets from "@/components/studio/StylePresets";
import {
  fonts,
  fontSize,
  radius,
  shadows,
  spacing,
} from "@/constants/theme";
import { Sparkles, Wand2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

export default function StudioScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [selectedStyle, setSelectedStyle] = useState("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Sparkles size={20} color={colors.accent} strokeWidth={2} />
            <Text style={styles.title}>AI Decoration Studio</Text>
          </View>
          <Text style={styles.subtitle}>
            Transform any room with AI-powered interior design
          </Text>
        </View>

        <View style={styles.workflowContainer}>
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>1. Upload Room Photo</Text>
            <ImageUploader onUpload={() => {}} />
          </View>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>2. Choose Style Preset</Text>
            <StylePresets
              selected={selectedStyle}
              onSelect={setSelectedStyle}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.generateButton,
              isGenerating && styles.generateButtonDisabled,
              shadows.md,
            ]}
            onPress={handleGenerate}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Wand2 size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.generateButtonText}>
                  Begin Transformation
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {(isGenerating || hasGenerated) && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {isGenerating
                  ? "Creating your design..."
                  : "Transformation Results"}
              </Text>
              {!isGenerating && <Text style={styles.resultsBadge}>New</Text>}
            </View>
            <ResultGallery isGenerating={isGenerating} />
          </View>
        )}

        <View style={{ height: spacing["4xl"] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing["4xl"],
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  workflowContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing["2xl"],
  },
  stepContainer: {
    gap: spacing.md,
  },
  stepTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.text,
    marginLeft: 4,
  },
  generateButton: {
    flexDirection: "row",
    backgroundColor: colors.accent,
    height: 56,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  generateButtonDisabled: {
    backgroundColor: colors.accentDark,
    opacity: 0.8,
  },
  generateButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.md,
    color: "#FFFFFF",
  },
  resultsSection: {
    marginTop: spacing["3xl"],
    paddingTop: spacing["2xl"],
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  resultsTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  resultsBadge: {
    backgroundColor: colors.accentLight,
    color: colors.accent,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
});
