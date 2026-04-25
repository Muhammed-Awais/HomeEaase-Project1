import ImageUploader from "@/components/studio/ImageUploader";
import StylePresets from "@/components/studio/StylePresets";
import { fonts, fontSize, radius, shadows, spacing } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { transformRoom } from "@/services/decorationService";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import {
  AlertCircle,
  Download,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function StudioScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [selectedStyle, setSelectedStyle] = useState("1");
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(
    "Transforming your room..."
  );
  const [resultImageBase64, setResultImageBase64] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!uploadedImageUri) {
      Alert.alert("No Photo", "Please upload a room photo first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResultImageBase64(null);
    setGenerationStatus("Transforming your room...");

    try {
      const base64 = await transformRoom(
        uploadedImageUri,
        selectedStyle,
        () => setGenerationStatus("Sending to OpenAI, please wait...")
      );
      setResultImageBase64(base64);
    } catch (err: any) {
      setError(
        err?.message ?? "Transformation failed. Please check your connection and try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImageBase64) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Allow photo library access to save the image."
        );
        return;
      }

      const base64Data = resultImageBase64.split(",")[1];
      const fileUri = `${FileSystem.documentDirectory}transformed_room_${Date.now()}.jpg`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert("Saved!", "Transformed image saved to your gallery.");
    } catch {
      Alert.alert("Error", "Failed to save image. Please try again.");
    }
  };

  const handleReset = () => {
    setUploadedImageUri(null);
    setResultImageBase64(null);
    setError(null);
    setGenerationStatus("Transforming your room...");
    setSelectedStyle("1");
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
            <ImageUploader
              onImageSelected={setUploadedImageUri}
              selectedImage={uploadedImageUri}
            />
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
              (isGenerating || !uploadedImageUri) &&
                styles.generateButtonDisabled,
              shadows.md,
            ]}
            onPress={handleGenerate}
            disabled={isGenerating || !uploadedImageUri}
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

        {isGenerating && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingTitle}>Creating Your Design</Text>
            <Text style={styles.loadingStatus}>{generationStatus}</Text>
            <Text style={styles.loadingNote}>
              This may take up to 30 seconds
            </Text>
          </View>
        )}

        {!isGenerating && error && (
          <View style={styles.errorSection}>
            <AlertCircle size={36} color="#E53E3E" strokeWidth={1.5} />
            <Text style={styles.errorTitle}>Transformation Failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, shadows.sm]}
              onPress={handleGenerate}
              activeOpacity={0.8}
            >
              <RefreshCw size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isGenerating && resultImageBase64 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Transformation Results</Text>
              <Text style={styles.resultsBadge}>New</Text>
            </View>

            <View style={styles.imageBlock}>
              <Text style={styles.imageLabel}>After — AI Redesign</Text>
              <Image
                source={{ uri: resultImageBase64 }}
                style={styles.resultImage}
                resizeMode="cover"
              />
            </View>

            {uploadedImageUri && (
              <View style={styles.imageBlock}>
                <Text style={styles.imageLabel}>Before — Original</Text>
                <Image
                  source={{ uri: uploadedImageUri }}
                  style={styles.resultImage}
                  resizeMode="cover"
                />
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.downloadButton, shadows.sm]}
                onPress={handleDownload}
                activeOpacity={0.8}
              >
                <Download size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.downloadButtonText}>Download</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resetButton, shadows.sm]}
                onPress={handleReset}
                activeOpacity={0.8}
              >
                <RefreshCw size={18} color={colors.accent} strokeWidth={2} />
                <Text style={styles.resetButtonText}>Try Another Style</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: spacing["4xl"] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
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
      opacity: 0.6,
    },
    generateButtonText: {
      fontFamily: fonts.bodyBold,
      fontSize: fontSize.md,
      color: "#FFFFFF",
    },
    loadingSection: {
      marginTop: spacing["3xl"],
      paddingTop: spacing["2xl"],
      paddingHorizontal: spacing.xl,
      alignItems: "center",
      gap: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    loadingTitle: {
      fontFamily: fonts.heading,
      fontSize: fontSize.lg,
      color: colors.text,
      marginTop: spacing.md,
    },
    loadingStatus: {
      fontFamily: fonts.body,
      fontSize: fontSize.base,
      color: colors.accent,
      textAlign: "center",
    },
    loadingNote: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: "center",
    },
    errorSection: {
      marginTop: spacing["3xl"],
      paddingTop: spacing["2xl"],
      paddingHorizontal: spacing.xl,
      alignItems: "center",
      gap: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    errorTitle: {
      fontFamily: fonts.heading,
      fontSize: fontSize.lg,
      color: colors.text,
    },
    errorMessage: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    retryButton: {
      flexDirection: "row",
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    retryButtonText: {
      fontFamily: fonts.bodyBold,
      fontSize: fontSize.sm,
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
    imageBlock: {
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.lg,
    },
    imageLabel: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    resultImage: {
      width: "100%",
      height: width - spacing.xl * 2,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
    },
    actionButtons: {
      paddingHorizontal: spacing.xl,
      gap: spacing.md,
    },
    downloadButton: {
      flexDirection: "row",
      backgroundColor: colors.accent,
      height: 52,
      borderRadius: radius.xl,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    downloadButtonText: {
      fontFamily: fonts.bodyBold,
      fontSize: fontSize.md,
      color: "#FFFFFF",
    },
    resetButton: {
      flexDirection: "row",
      backgroundColor: colors.accentLight,
      height: 52,
      borderRadius: radius.xl,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      borderWidth: 1.5,
      borderColor: colors.accent + "40",
    },
    resetButtonText: {
      fontFamily: fonts.bodyBold,
      fontSize: fontSize.md,
      color: colors.accent,
    },
  });
