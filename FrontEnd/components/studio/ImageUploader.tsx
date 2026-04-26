import { useTheme } from "@/context/ThemeContext";
import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import { Camera, ImageIcon } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImageUploaderProps {
  onImageSelected: (uri: string) => void;
  selectedImage?: string | null;
}

export default function ImageUploader({
  onImageSelected,
  selectedImage,
}: ImageUploaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take a photo."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Gallery access is needed to select a photo."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  if (selectedImage) {
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: selectedImage }}
          style={styles.previewImage}
          resizeMode="cover"
        />
        <View style={styles.changeRow}>
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={openCamera}
            activeOpacity={0.8}
          >
            <Camera size={15} color={colors.accent} strokeWidth={1.8} />
            <Text style={styles.changeBtnText}>Camera</Text>
          </TouchableOpacity>
          <View style={styles.changeDivider} />
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={openGallery}
            activeOpacity={0.8}
          >
            <ImageIcon size={15} color={colors.accent} strokeWidth={1.8} />
            <Text style={styles.changeBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <View style={styles.iconCircle}>
          <Camera size={22} color={colors.accent} strokeWidth={1.8} />
        </View>
        <View style={styles.iconCircle}>
          <ImageIcon size={22} color={colors.accent} strokeWidth={1.8} />
        </View>
      </View>
      <Text style={styles.title}>Upload Living Room Photo</Text>
      <Text style={styles.subtitle}>
        Take a photo or choose from gallery
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.pickBtn}
          onPress={openCamera}
          activeOpacity={0.85}
        >
          <Camera size={18} color="#FFFFFF" strokeWidth={1.8} />
          <Text style={styles.pickBtnText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pickBtn}
          onPress={openGallery}
          activeOpacity={0.85}
        >
          <ImageIcon size={18} color="#FFFFFF" strokeWidth={1.8} />
          <Text style={styles.pickBtnText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.accentLight,
      borderRadius: radius.xl,
      padding: spacing["2xl"],
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.accent + "30",
      borderStyle: "dashed",
    },
    iconRow: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.base,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.md,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    buttonRow: {
      flexDirection: "row",
      gap: spacing.md,
    },
    pickBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      gap: spacing.xs,
    },
    pickBtnText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.sm,
      color: "#FFFFFF",
    },
    previewContainer: {
      borderRadius: radius.xl,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: colors.accent + "50",
    },
    previewImage: {
      width: "100%",
      height: 220,
    },
    changeRow: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    changeBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      gap: spacing.xs,
    },
    changeDivider: {
      width: 1,
      backgroundColor: colors.borderLight,
    },
    changeBtnText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.sm,
      color: colors.accent,
    },
  });
