import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { useTheme } from "@/context/ThemeContext";
import { fonts, fontSize, radius, spacing, shadows } from "@/constants/theme";
import { AlertTriangle, Info, Trash2, X } from "lucide-react-native";

interface ConfirmationModalProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: "danger" | "info" | "success";
}

const { width } = Dimensions.get("window");

export default function ConfirmationModal({
  isVisible,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  type = "danger",
}: ConfirmationModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle size={32} color={colors.danger} />;
      case "success":
        return <Trash2 size={32} color={colors.success} />; // Example, can change to proper icon
      default:
        return <Info size={32} color={colors.accent} />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case "danger":
        return { backgroundColor: colors.danger + "15" };
      case "success":
        return { backgroundColor: colors.success + "15" };
      default:
        return { backgroundColor: colors.accent + "15" };
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={!isLoading ? onCancel : undefined}
      onBackButtonPress={!isLoading ? onCancel : undefined}
      backdropOpacity={0.5}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modal}
    >
      <View style={styles.container}>
        {/* Close Button */}
        {!isLoading && (
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <X size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}

        <View style={styles.content}>
          {/* Icon Header */}
          <View style={[styles.iconContainer, getHeaderBg()]}>
            {getIcon()}
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                type === "danger" ? styles.dangerButton : styles.confirmButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    modal: {
      margin: 0,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      width: "100%",
      maxWidth: 400,
      overflow: "hidden",
      ...shadows.lg,
    },
    closeButton: {
      position: "absolute",
      right: spacing.md,
      top: spacing.md,
      zIndex: 10,
      padding: spacing.xs,
    },
    content: {
      padding: spacing.xl,
      alignItems: "center",
    },
    iconContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    textContainer: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    title: {
      fontFamily: fonts.bodyBold,
      fontSize: fontSize.lg,
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: "center",
    },
    description: {
      fontFamily: fonts.body,
      fontSize: fontSize.base,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: spacing.md,
      width: "100%",
    },
    button: {
      flex: 1,
      height: 52,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.base,
      color: colors.textSecondary,
    },
    confirmButton: {
      backgroundColor: colors.accent,
    },
    dangerButton: {
      backgroundColor: colors.danger,
    },
    confirmButtonText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.base,
      color: "#FFFFFF",
    },
    disabledButton: {
      opacity: 0.7,
    },
  });
