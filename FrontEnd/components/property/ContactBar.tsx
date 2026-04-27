import { useTheme } from "@/context/ThemeContext";
import { fonts, fontSize, shadows, spacing } from "@/constants/theme";
import { Property } from "@/constants/types";
import { MessageCircle, Phone } from "lucide-react-native";
import React from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ContactBarProps {
  landlord: Property["landlord"];
}

export default function ContactBar({ landlord }: ContactBarProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={[styles.container, shadows.lg]}>
      <View style={styles.landlordInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {landlord.name ? landlord.name[0].toUpperCase() : "L"}
          </Text>
        </View>
        <View>
          <Text style={styles.name}>{landlord.name}</Text>
          <Text style={styles.role}>Landlord</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => Linking.openURL(`tel:${landlord.phone}`)}
        >
          <Phone size={18} color={colors.accent} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    paddingBottom: Platform.OS === "ios" ? spacing["2xl"] : spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  landlordInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.accent,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.text,
  },
  role: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    height: 44,
    borderRadius: 22,
  },
  messageText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: "#FFFFFF",
  },
});
