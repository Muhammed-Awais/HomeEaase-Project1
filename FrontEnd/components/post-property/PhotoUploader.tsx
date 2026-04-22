import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import { Plus, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/context/ThemeContext";

interface PhotoUploaderProps {
  photos: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function PhotoUploader({
  photos,
  onAdd,
  onRemove,
}: PhotoUploaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Property Photos</Text>
      <Text style={styles.hint}>Add up to 3 photos</Text>
      <View style={styles.grid}>
        {photos.map((uri, index) => (
          <View key={index} style={styles.photoSlot}>
            <Image 
              source={{ uri }} 
              style={styles.photoPlaceholder}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(index)}
            >
              <X size={12} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < 3 && (
          <TouchableOpacity style={styles.addSlot} onPress={onAdd}>
            <Plus size={24} color={colors.accent} strokeWidth={1.8} />
            <Text style={styles.addText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  photoSlot: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  photoNum: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.accent,
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  addSlot: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.accent + "40",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.accent,
    marginTop: spacing.xs,
  },
});
